"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const axios_1 = __importDefault(require("axios"));
const database_1 = require("../../config/database");
const response_utils_1 = require("../../shared/utils/response.utils");
const socket_1 = require("../../config/socket");
const weather_service_1 = require("../weather/weather.service");
class AlertsService {
    static async getAll(userId, query) {
        const { tripId, isRead, page = 1 } = query;
        const where = {
            trip: { userId },
        };
        if (tripId)
            where.tripId = tripId;
        if (isRead !== undefined)
            where.isRead = isRead === 'true';
        return await database_1.prisma.alert.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (Number(page) - 1) * 10,
            take: 10,
        });
    }
    static async subscribe(userId, tripId) {
        const trip = await database_1.prisma.trip.findUnique({
            where: { id: tripId },
            include: { destination: true },
        });
        if (!trip || trip.userId !== userId) {
            throw new response_utils_1.AppError('Trip not found', 404);
        }
        let weatherMessage = 'Weather data unavailable';
        let severity = 'INFO';
        try {
            const weatherRes = await axios_1.default.get(`https://api.openweathermap.org/data/2.5/weather`, {
                params: {
                    q: `${trip.destination.name},${trip.destination.country}`,
                    appid: process.env.OPENWEATHER_API_KEY,
                    units: 'metric',
                },
                timeout: 5000,
            });
            const w = weatherRes.data;
            const temp = Math.round(w.main.temp);
            const desc = w.weather[0].description;
            const humidity = w.main.humidity;
            weatherMessage = `Current weather in ${trip.destination.name}: ${desc}, ${temp}°C, humidity ${humidity}%. `;
            if (w.weather[0].main === 'Thunderstorm' || w.weather[0].main === 'Snow') {
                severity = 'WARNING';
                weatherMessage += 'Pack accordingly!';
            }
            else if (temp > 38) {
                severity = 'WARNING';
                weatherMessage += 'Extreme heat expected. Stay hydrated!';
            }
            else {
                weatherMessage += 'Great conditions for travel!';
            }
        }
        catch (err) {
            console.error('Weather API error:', err);
        }
        const alert = await database_1.prisma.alert.create({
            data: {
                tripId,
                type: 'WEATHER',
                title: `Weather Update for ${trip.destination.name}`,
                message: weatherMessage,
                severity,
            },
        });
        socket_1.io.to(`trip:${tripId}`).emit('alert:new', { alert });
        return alert;
    }
    static async markAsRead(userId, id) {
        const alert = await database_1.prisma.alert.findFirst({
            where: { id, trip: { userId } },
        });
        if (!alert)
            throw new response_utils_1.AppError('Alert not found', 404);
        return await database_1.prisma.alert.update({
            where: { id },
            data: { isRead: true },
        });
    }
    static async delete(userId, id) {
        const alert = await database_1.prisma.alert.findFirst({
            where: { id, trip: { userId } },
        });
        if (!alert)
            throw new response_utils_1.AppError('Alert not found', 404);
        await database_1.prisma.alert.delete({ where: { id } });
    }
    static async broadcast(tripIds, data) {
        const alerts = await Promise.all(tripIds.map((tripId) => database_1.prisma.alert.create({
            data: {
                tripId,
                ...data,
            },
        })));
        alerts.forEach((alert) => {
            socket_1.io.to(`trip:${alert.tripId}`).emit('alert:new', { alert });
        });
        return alerts;
    }
    static async getWeatherAlerts(userId) {
        const now = new Date();
        const fiveDaysFromNow = new Date();
        fiveDaysFromNow.setDate(now.getDate() + 5);
        // Fetch trips that are in planning, upcoming, or ongoing status
        // and start within the next 5 days (or are already ongoing)
        const trips = await database_1.prisma.trip.findMany({
            where: {
                userId,
                status: { in: ['PLANNING', 'UPCOMING', 'ONGOING'] },
                startDate: { lte: fiveDaysFromNow },
                endDate: { gte: now },
            },
            include: { destination: true },
            orderBy: { startDate: 'asc' },
        });
        const weatherAlerts = await Promise.all(trips.map(async (trip) => {
            const forecastData = await weather_service_1.WeatherService.getWeatherForecast(trip.destination.name, trip.startDate, trip.endDate);
            if (forecastData.day.length === 0 && forecastData.night.length === 0)
                return null;
            // Fetch smart news and family tips from AI Service
            let smartData = { news: [], family_tip: "" };
            try {
                const aiRes = await axios_1.default.post(`${process.env.AI_SERVICE_URL}/smart-alerts`, {
                    destination: trip.destination.name,
                    tripId: trip.id,
                    weather_summary: forecastData.day[0] || forecastData.night[0] // Pass first day as context
                }, { timeout: 10000 });
                if (aiRes.data.success) {
                    smartData = aiRes.data.data;
                }
            }
            catch (err) {
                console.error("AI Service Error for smart alerts:", err);
            }
            return {
                tripId: trip.id,
                destination: trip.destination.name,
                startDate: trip.startDate,
                endDate: trip.endDate,
                dayForecast: forecastData.day,
                nightForecast: forecastData.night,
                news: smartData.news,
                familyTip: smartData.family_tip
            };
        }));
        return weatherAlerts.filter((alert) => alert !== null);
    }
}
exports.AlertsService = AlertsService;
//# sourceMappingURL=alerts.service.js.map