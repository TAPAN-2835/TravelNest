import { Router } from 'express';
import { TripsController } from './trips.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createTripSchema, updateTripSchema, updateTripStatusSchema } from './trips.schema';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: List all user trips
 *     tags: [Trips]
 */
router.get('/', TripsController.getAll);

/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Create new trip
 *     tags: [Trips]
 */
router.post('/', validate(createTripSchema), TripsController.create);

/**
 * @swagger
 * /api/trips/:id:
 *   get:
 *     summary: Get trip details
 *     tags: [Trips]
 */
router.get('/:id', TripsController.getById);

/**
 * @swagger
 * /api/trips/:id:
 *   put:
 *     summary: Update trip
 *     tags: [Trips]
 */
router.put('/:id', validate(updateTripSchema), TripsController.update);

/**
 * @swagger
 * /api/trips/:id:
 *   delete:
 *     summary: Delete trip
 *     tags: [Trips]
 */
router.delete('/:id', TripsController.delete);

/**
 * @swagger
 * /api/trips/:id/status:
 *   patch:
 *     summary: Update trip status
 *     tags: [Trips]
 */
router.patch('/:id/status', validate(updateTripStatusSchema), TripsController.updateStatus);

export default router;
