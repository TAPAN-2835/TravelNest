import { prisma } from '../../config/database';
import { AppError } from '../../shared/utils/response.utils';

export class AdminService {
  static async getDashboard() {
    const [totalUsers, totalTrips, totalBookings] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.booking.count(),
    ]);

    const revenue = await prisma.booking.aggregate({
      _sum: { amount: true },
      where: { status: 'CONFIRMED' },
    });

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newSignups = await prisma.user.count({
      where: { createdAt: { gte: oneWeekAgo } },
    });

    const topDestinations = await prisma.destination.findMany({
      include: { _count: { select: { bookings: true } } },
      orderBy: { bookings: { _count: 'desc' } },
      take: 5,
    });

    return {
      stats: {
        totalUsers,
        totalTrips,
        totalBookings,
        totalRevenue: revenue._sum.amount || 0,
        newSignups,
      },
      topDestinations,
    };
  }

  static async getUsers(query: any) {
    const { page = 1, limit = 10, role, search } = query;
    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page: Number(page), limit: Number(limit) };
  }

  static async updateUserRole(userId: string, role: any) {
    return await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  static async getAnalytics(period: string) {
    // Simplified temporal analysis logic
    return {
      bookingsOverTime: [], // placeholder for grouped aggregation
      revenueByDestination: [],
      userGrowth: [],
    };
  }
}
