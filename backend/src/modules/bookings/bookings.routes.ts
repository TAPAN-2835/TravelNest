import { Router } from 'express';
import { BookingsController } from './bookings.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createBookingSchema, updateBookingSchema } from './bookings.schema';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: List all user bookings
 *     tags: [Bookings]
 */
router.get('/', BookingsController.getAll);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create new booking
 *     tags: [Bookings]
 */
router.post('/', validate(createBookingSchema), BookingsController.create);

/**
 * @swagger
 * /api/bookings/:id:
 *   get:
 *     summary: Get booking details
 *     tags: [Bookings]
 */
router.get('/:id', BookingsController.getById);

/**
 * @swagger
 * /api/bookings/:id:
 *   put:
 *     summary: Update booking
 *     tags: [Bookings]
 */
router.put('/:id', validate(updateBookingSchema), BookingsController.update);

/**
 * @swagger
 * /api/bookings/:id:
 *   delete:
 *     summary: Cancel booking
 *     tags: [Bookings]
 */
router.delete('/:id', BookingsController.cancel);

export default router;
