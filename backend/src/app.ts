import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerOptions from './swagger.config';
import { globalErrorHandler } from './middlewares/error.middleware';
import { limiter } from './middlewares/rateLimit.middleware';

// Routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import destinationRoutes from './modules/destinations/destinations.routes';
import tripRoutes from './modules/trips/trips.routes';
import itineraryRoutes from './modules/itinerary/itinerary.routes';
import bookingRoutes from './modules/bookings/bookings.routes';
import budgetRoutes from './modules/budget/budget.routes';
import reviewRoutes from './modules/reviews/reviews.routes';
import documentRoutes from './modules/documents/documents.routes';
import alertRoutes from './modules/alerts/alerts.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(morgan('dev'));
app.use('/api', limiter);

// Swagger
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Route Registration
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// Global Error Handler
app.use(globalErrorHandler);

export default app;
