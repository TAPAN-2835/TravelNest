import cron from 'node-cron';
import { prisma } from '../config/database';
import { sendEmail, tripReminderEmail } from '../shared/utils/email.utils';
import { io } from '../config/socket';

export const setupTripReminderJob = () => {
  // Every day at 9:00 AM "0 9 * * *"
  cron.schedule('0 9 * * *', async () => {
    console.log('Running Trip Reminder Job...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(tomorrow);
    nextDay.setDate(nextDay.getDate() + 1);

    const upcomingTrips = await prisma.trip.findMany({
      where: {
        startDate: {
          gte: tomorrow,
          lt: nextDay,
        },
      },
      include: { user: true, destination: true },
    });

    for (const trip of upcomingTrips) {
      // 1. Send Email
      const { subject, html } = tripReminderEmail(trip, trip.user);
      await sendEmail(trip.user.email, subject, html);

      // 2. Create Alert
      const alert = await prisma.alert.create({
        data: {
          tripId: trip.id,
          type: 'TRIP_REMINDER',
          title: `Trip Reminder: ${trip.destination.name}`,
          message: `Your trip to ${trip.destination.name} starts tomorrow! 🌍`,
          severity: 'INFO',
        },
      });

      // 3. Emit Socket Event
      io.to(`user:${trip.userId}`).emit('alert:new', { alert });
    }
  });
};
