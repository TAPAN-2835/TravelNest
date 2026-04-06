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
        ...data,
        userId,
        budget: {
          create: {
            totalAmount: data.totalBudget,
            currency: data.currency,
            userId,
          },
        },
      },
    });
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
