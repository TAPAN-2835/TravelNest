import 'dotenv/config';
import http from 'http';
import app from './app';
import { connectMongoDB, prisma } from './config/database';
import { setupSocket } from './config/socket';
import { setupTripReminderJob } from './jobs/tripReminder.job';
import { setupCleanupDocumentsJob } from './jobs/cleanupDocuments.job';
import './config/passport'; // ensure passport strategies are loaded

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Setup Services
setupSocket(server);
setupTripReminderJob();
setupCleanupDocumentsJob();

const startServer = async () => {
  try {
    await connectMongoDB();
    await prisma.$connect();

    server.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
