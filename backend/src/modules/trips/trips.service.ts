import { prisma } from '../../config/database';
import { AppError } from '../../shared/utils/response.utils';
import { io } from '../../config/socket';

export class TripsService {
  static async getAll(userId: string, query: any) {
    const { status, page = 1, limit = 10 } = query;
    const where: any = { userId };
    if (status) where.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: { destination: true },
        orderBy: { startDate: 'asc' },
        skip,
        take,
      }),
      prisma.trip.count({ where }),
    ]);

    return {
      data: trips,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      }
    };
  }

  static async create(userId: string, data: any) {
    return await prisma.trip.create({
      data: {
        title: data.title,
        destinationId: data.destinationId,
        startDate: data.startDate,
        endDate: data.endDate,
        totalBudget: Number(data.totalBudget) || 0,
        currency: data.currency || 'INR',
        groupSize: data.groupSize || 1,
        travelStyle: data.travelStyle || 'General',
        notes: data.notes,
        coverImage: data.coverImage,
        userId,
        budget: {
          create: {
            totalAmount: Number(data.totalBudget) || 0,
            currency: data.currency || 'INR',
            userId,
          },
        },
      },
    });
  }

  static async saveGeneratedTrip(userId: string, data: any) {
    const trip = await prisma.trip.create({
      data: {
        title: data.title,
        destinationId: data.destinationId,
        startDate: data.startDate,
        endDate: data.endDate,
        totalBudget: data.totalBudget,
        travelStyle: data.travelStyle,
        userId,
        budget: {
          create: {
            totalAmount: data.totalBudget,
            currency: data.currency || 'INR',
            userId,
          },
        },
      },
    });

    if (data.itineraryData) {
      const ItineraryModel = (await import('../itinerary/itinerary.model')).default;
      const itinerary = await ItineraryModel.create({
        tripId: trip.id,
        userId,
        destination: data.itineraryData.destination,
        duration: data.itineraryData.days?.length || 3,
        days: data.itineraryData.days || [],
        flights: data.itineraryData.flights || [],
        hotels: data.itineraryData.hotels || [],
        totalEstimatedCost: data.itineraryData.totalEstimatedCost || 0,
        currency: 'INR',
      });
      await prisma.trip.update({
        where: { id: trip.id },
        data: { itineraryId: (itinerary as any)._id.toString() },
      });
    }

    return trip;
  }

  static async getById(userId: string, id: string) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        destination: true,
        bookings: true,
        budget: { include: { expenses: true } },
        documents: true,
      },
    });

    if (!trip || trip.userId !== userId) {
      throw new AppError('Trip not found or unauthorized', 404);
    }

    return trip;
  }

  static async update(userId: string, id: string, data: any) {
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip || trip.userId !== userId) {
      throw new AppError('Trip not found or unauthorized', 404);
    }

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data,
    });

    if (data.status && data.status !== trip.status) {
      io.to(`trip:${id}`).emit('trip:updated', { trip: updatedTrip });
    }

    return updatedTrip;
  }

  static async delete(userId: string, id: string) {
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip || trip.userId !== userId) {
      throw new AppError('Trip not found or unauthorized', 404);
    }

    // Cascade delete other resources if not handled by DB
    // Prisma handles cascade in schema.prisma for bookings, budget, alerts
    await prisma.trip.delete({ where: { id } });
  }

  static async updateStatus(userId: string, id: string, status: string) {
    return this.update(userId, id, { status });
  }
}
