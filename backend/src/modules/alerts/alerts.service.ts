import axios from 'axios';
import { prisma } from '../../config/database';
import { AppError } from '../../shared/utils/response.utils';
import { io } from '../../config/socket';

export class AlertsService {
  static async getAll(userId: string, query: any) {
    const { tripId, isRead, page = 1 } = query;
    const where: any = {
      trip: { userId },
    };
    if (tripId) where.tripId = tripId;
    if (isRead !== undefined) where.isRead = isRead === 'true';

    return await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * 10,
      take: 10,
    });
  }

  static async subscribe(userId: string, tripId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { destination: true },
    });

    if (!trip || trip.userId !== userId) {
      throw new AppError('Trip not found', 404);
    }

    let weatherMessage = 'Weather data unavailable';
    let severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO';

    try {
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            q: `${trip.destination.name},${trip.destination.country}`,
            appid: process.env.OPENWEATHER_API_KEY,
            units: 'metric',
          },
          timeout: 5000,
        }
      );
      const w = weatherRes.data;
      const temp = Math.round(w.main.temp);
      const desc = w.weather[0].description;
      const humidity = w.main.humidity;
      weatherMessage = `Current weather in ${trip.destination.name}: ${desc}, ${temp}°C, humidity ${humidity}%. `;
      
      if (w.weather[0].main === 'Thunderstorm' || w.weather[0].main === 'Snow') {
        severity = 'WARNING';
        weatherMessage += 'Pack accordingly!';
      } else if (temp > 38) {
        severity = 'WARNING';
        weatherMessage += 'Extreme heat expected. Stay hydrated!';
      } else {
        weatherMessage += 'Great conditions for travel!';
      }
    } catch (err) {
      console.error('Weather API error:', err);
    }

    const alert = await prisma.alert.create({
      data: {
        tripId,
        type: 'WEATHER',
        title: `Weather Update for ${trip.destination.name}`,
        message: weatherMessage,
        severity,
      },
    });

    io.to(`trip:${tripId}`).emit('alert:new', { alert });
    return alert;
  }

  static async markAsRead(userId: string, id: string) {
    const alert = await prisma.alert.findFirst({
      where: { id, trip: { userId } },
    });

    if (!alert) throw new AppError('Alert not found', 404);

    return await prisma.alert.update({
      where: { id },
      data: { isRead: true },
    });
  }

  static async delete(userId: string, id: string) {
    const alert = await prisma.alert.findFirst({
      where: { id, trip: { userId } },
    });

    if (!alert) throw new AppError('Alert not found', 404);

    await prisma.alert.delete({ where: { id } });
  }

  static async broadcast(tripIds: string[], data: any) {
    const alerts = await Promise.all(
      tripIds.map((tripId) =>
        prisma.alert.create({
          data: {
            tripId,
            ...data,
          },
        })
      )
    );

    alerts.forEach((alert) => {
      io.to(`trip:${alert.tripId}`).emit('alert:new', { alert });
    });

    return alerts;
  }
}
