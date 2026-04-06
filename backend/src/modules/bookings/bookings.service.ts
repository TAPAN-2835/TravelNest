import { prisma } from '../../config/database';
import { AppError } from '../../shared/utils/response.utils';
import { sendEmail, bookingConfirmationEmail, bookingCancellationEmail } from '../../shared/utils/email.utils';
import { invalidateCache } from '../../shared/utils/cache.utils';

export class BookingsService {
  static async getAll(userId: string, query: any) {
    const { tripId, type, status } = query;
    const where: any = { userId };
    if (tripId) where.tripId = tripId;
    if (type) where.type = type;
    if (status) where.status = status;

    return await prisma.booking.findMany({
      where,
      include: { destination: true, trip: true },
    });
  }

  static async create(userId: string, data: any) {
    const booking = await prisma.booking.create({
      data: {
        ...data,
        userId,
      },
      include: { destination: true, user: true },
    });

    // Add expense to budget automatically
    const trip = await prisma.trip.findUnique({
      where: { id: data.tripId },
      include: { budget: true },
    });

    if (trip?.budget) {
      await prisma.expense.create({
        data: {
          budgetId: trip.budget.id,
          category: data.type === 'HOTEL' ? 'HOTELS' : data.type === 'FLIGHT' ? 'FLIGHTS' : 'MISC',
          description: `${data.type} Booking: ${data.providerName}`,
          amount: data.amount,
          date: new Date(),
        },
      });
    }

    const { subject, html } = bookingConfirmationEmail(booking, booking.user);
    await sendEmail(booking.user.email, subject, html);

    await invalidateCache(`user:stats:${userId}`);
    return booking;
  }

  static async getById(userId: string, id: string) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { destination: true, trip: true },
    });

    if (!booking || booking.userId !== userId) {
      throw new AppError('Booking not found', 404);
    }

    return booking;
  }

  static async update(userId: string, id: string, data: any) {
    return await prisma.booking.update({
      where: { id, userId },
      data,
    });
  }

  static async cancel(userId: string, id: string) {
    const booking = await prisma.booking.update({
      where: { id, userId },
      data: { status: 'CANCELLED' },
      include: { destination: true, user: true },
    });

    const { subject, html } = bookingCancellationEmail(booking, booking.user);
    await sendEmail(booking.user.email, subject, html);

    return booking;
  }
}
