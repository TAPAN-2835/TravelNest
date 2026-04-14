import { Router } from 'express';
import { AlertsController } from './alerts.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { subscribeAlertsSchema, broadcastAlertSchema } from './alerts.schema';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Get user alerts
 *     tags: [Alerts]
 */
router.get('/', AlertsController.getAll);

/**
 * @swagger
 * /api/alerts/weather:
 *   get:
 *     summary: Get real-time weather alerts for upcoming trips
 *     tags: [Alerts]
 */
router.get('/weather', AlertsController.getWeatherAlerts);

/**
 * @swagger
 * /api/alerts/subscribe:
 *   post:
 *     summary: Subscribe to destination alerts
 *     tags: [Alerts]
 */
router.post('/subscribe', validate(subscribeAlertsSchema), AlertsController.subscribe);

/**
 * @swagger
 * /api/alerts/:id/read:
 *   patch:
 *     summary: Mark alert as read
 *     tags: [Alerts]
 */
router.patch('/:id/read', AlertsController.markAsRead);

/**
 * @swagger
 * /api/alerts/:id:
 *   delete:
 *     summary: Delete alert
 *     tags: [Alerts]
 */
router.delete('/:id', AlertsController.delete);

/**
 * @swagger
 * /api/alerts/broadcast:
 *   post:
 *     summary: Broadcast alert to multiple trips (Admin)
 *     tags: [Alerts]
 */
router.post('/broadcast', authorize('ADMIN'), validate(broadcastAlertSchema), AlertsController.broadcast);

export default router;
