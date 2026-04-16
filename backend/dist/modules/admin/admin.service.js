"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const database_1 = require("../../config/database");
const response_utils_1 = require("../../shared/utils/response.utils");
const REVENUE_PER_TRIP = 500;
class AdminService {
    // ── Dashboard Stats (Real Metadata) ─────────────────────────────────────────
    static async getStats() {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [totalUsers, totalTrips, totalBookings, revenueData, newSignups, recentUsers, recentTrips, topDestinationsRaw] = await Promise.all([
            database_1.prisma.user.count(),
            database_1.prisma.trip.count(),
            database_1.prisma.booking.count(),
            database_1.prisma.booking.aggregate({
                _sum: { amount: true },
                where: { status: 'CONFIRMED' },
            }),
            database_1.prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
            database_1.prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, name: true, email: true, createdAt: true, role: true }
            }),
            database_1.prisma.trip.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    status: true,
                    user: { select: { name: true } },
                    destination: { select: { name: true } }
                }
            }),
            database_1.prisma.destination.findMany({
                take: 5,
                include: { _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } } },
                orderBy: { bookings: { _count: 'desc' } },
            })
        ]);
        // Format top destinations
        const topDestinations = topDestinationsRaw.map(d => ({
            id: d.id,
            name: d.name,
            country: d.country,
            bookings: d._count.bookings
        }));
        const topDestination = topDestinations[0]?.name || 'N/A';
        return {
            totalUsers,
            totalTrips,
            totalBookings,
            topDestination,
            topDestinations,
            totalRevenue: revenueData._sum.amount || 0,
            newSignups,
            recentUsers,
            recentTrips
        };
    }
    // ── All Users (with trip count) ──────────────────────────────────────────
    static async getUsers(query) {
        const { page = 1, limit = 20, search } = query;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [rawUsers, total] = await Promise.all([
            database_1.prisma.user.findMany({
                where,
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    _count: { select: { trips: true } },
                },
            }),
            database_1.prisma.user.count({ where }),
        ]);
        const users = rawUsers.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            totalTrips: u._count.trips,
            createdAt: u.createdAt,
        }));
        return { users, total, page: Number(page), limit: Number(limit) };
    }
    // ── Single User with Trips ───────────────────────────────────────────────
    static async getUserById(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                trips: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        title: true,
                        startDate: true,
                        endDate: true,
                        totalBudget: true,
                        status: true,
                        destination: { select: { name: true, country: true } },
                    },
                },
            },
        });
        if (!user)
            throw new response_utils_1.AppError('User not found', 404);
        return user;
    }
    // ── All Trips (with user info) ───────────────────────────────────────────
    static async getTrips(query) {
        const { page = 1, limit = 20, status } = query;
        const where = {};
        if (status)
            where.status = status;
        const [trips, total] = await Promise.all([
            database_1.prisma.trip.findMany({
                where,
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    startDate: true,
                    endDate: true,
                    totalBudget: true,
                    status: true,
                    createdAt: true,
                    user: { select: { name: true, email: true } },
                    destination: { select: { name: true, country: true } },
                },
            }),
            database_1.prisma.trip.count({ where }),
        ]);
        return { trips, total, page: Number(page), limit: Number(limit) };
    }
    // ── Legacy endpoints (unchanged) ─────────────────────────────────────────
    static async getDashboard() {
        const [totalUsers, totalTrips, totalBookings] = await Promise.all([
            database_1.prisma.user.count(),
            database_1.prisma.trip.count(),
            database_1.prisma.booking.count(),
        ]);
        const revenue = await database_1.prisma.booking.aggregate({
            _sum: { amount: true },
            where: { status: 'CONFIRMED' },
        });
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newSignups = await database_1.prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } });
        const topDestinations = await database_1.prisma.destination.findMany({
            include: { _count: { select: { bookings: true } } },
            orderBy: { bookings: { _count: 'desc' } },
            take: 5,
        });
        return {
            stats: { totalUsers, totalTrips, totalBookings, totalRevenue: revenue._sum.amount || 0, newSignups },
            topDestinations,
        };
    }
    static async updateUserRole(userId, role) {
        return await database_1.prisma.user.update({ where: { id: userId }, data: { role } });
    }
    static async getAnalytics() {
        const days = 14;
        const timeSeries = [];
        // Generate dates for the last 14 days
        for (let i = days - 1; i >= 0; i--) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            startOfDay.setDate(startOfDay.getDate() - i);
            const endOfDay = new Date(startOfDay);
            endOfDay.setHours(23, 59, 59, 999);
            const [users, bookings, revenue] = await Promise.all([
                database_1.prisma.user.count({ where: { createdAt: { gte: startOfDay, lte: endOfDay } } }),
                database_1.prisma.booking.count({ where: { createdAt: { gte: startOfDay, lte: endOfDay } } }),
                database_1.prisma.booking.aggregate({
                    _sum: { amount: true },
                    where: {
                        status: 'CONFIRMED',
                        createdAt: { gte: startOfDay, lte: endOfDay }
                    }
                })
            ]);
            timeSeries.push({
                date: startOfDay.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                users,
                bookings,
                revenue: revenue._sum.amount || 0
            });
        }
        // Cumulate users for growth chart if needed, but here we show per-day acquisition
        return { timeSeries };
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=admin.service.js.map