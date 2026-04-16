"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const database_1 = require("../../config/database");
const response_utils_1 = require("../../shared/utils/response.utils");
const email_utils_1 = require("../../shared/utils/email.utils");
const cache_utils_1 = require("../../shared/utils/cache.utils");
class BookingsService {
    static async getAll(userId, query) {
        const { tripId, type, status } = query;
        const where = { userId };
        if (tripId)
            where.tripId = tripId;
        if (type)
            where.type = type;
        if (status)
            where.status = status;
        return await database_1.prisma.booking.findMany({
            where,
            include: { destination: true, trip: true },
        });
    }
    static async create(userId, data) {
        const booking = await database_1.prisma.booking.create({
            data: {
                ...data,
                userId,
            },
            include: { destination: true, user: true },
        });
        // Add expense to budget automatically
        const trip = await database_1.prisma.trip.findUnique({
            where: { id: data.tripId },
            include: { budget: true },
        });
        if (trip?.budget) {
            await database_1.prisma.expense.create({
                data: {
                    budgetId: trip.budget.id,
                    category: data.type === 'HOTEL' ? 'HOTELS' : data.type === 'FLIGHT' ? 'FLIGHTS' : 'MISC',
                    description: `${data.type} Booking: ${data.providerName}`,
                    amount: data.amount,
                    date: new Date(),
                },
            });
        }
        const { subject, html } = (0, email_utils_1.bookingConfirmationEmail)(booking, booking.user);
        await (0, email_utils_1.sendEmail)(booking.user.email, subject, html);
        await (0, cache_utils_1.invalidateCache)(`user:stats:${userId}`);
        return booking;
    }
    static async getById(userId, id) {
        const booking = await database_1.prisma.booking.findUnique({
            where: { id },
            include: { destination: true, trip: true },
        });
        if (!booking || booking.userId !== userId) {
            throw new response_utils_1.AppError('Booking not found', 404);
        }
        return booking;
    }
    static async update(userId, id, data) {
        return await database_1.prisma.booking.update({
            where: { id, userId },
            data,
        });
    }
    static async cancel(userId, id) {
        const booking = await database_1.prisma.booking.update({
            where: { id, userId },
            data: { status: 'CANCELLED' },
            include: { destination: true, user: true },
        });
        const { subject, html } = (0, email_utils_1.bookingCancellationEmail)(booking, booking.user);
        await (0, email_utils_1.sendEmail)(booking.user.email, subject, html);
        return booking;
    }
}
exports.BookingsService = BookingsService;
//# sourceMappingURL=bookings.service.js.map