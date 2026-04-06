import cron from 'node-cron';
import { prisma } from '../config/database';
import { io } from '../config/socket';

export const setupCleanupDocumentsJob = () => {
  // Every Sunday at midnight "0 0 * * 0"
  cron.schedule('0 0 * * 0', async () => {
    console.log('Running Document Cleanup Job...');

    const today = new Date();
    
    const expiredDocs = await prisma.document.findMany({
      where: {
        expiryDate: { lt: today },
      },
    });

    for (const doc of expiredDocs) {
      if (doc.tripId) {
        const alert = await prisma.alert.create({
          data: {
            tripId: doc.tripId,
            type: 'GENERAL',
            title: 'Document Expired',
            message: `Your document "${doc.name}" has expired.`,
            severity: 'WARNING',
          },
        });

        io.to(`user:${doc.userId}`).emit('alert:new', { alert });
      }
    }
  });
};
