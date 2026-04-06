import { Router } from 'express';
import { ItineraryController } from './itinerary.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  generateItinerarySchema,
  updateItineraryDaySchema,
  regenerateItinerarySchema,
} from './itinerary.schema';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/itinerary/generate:
 *   post:
 *     summary: Generate a new AI itinerary
 *     tags: [Itinerary]
 */
router.post('/generate', validate(generateItinerarySchema), ItineraryController.generate);

/**
 * @swagger
 * /api/itinerary/:tripId:
 *   get:
 *     summary: Get itinerary for a trip
 *     tags: [Itinerary]
 */
router.get('/:tripId', ItineraryController.getByTripId);

/**
 * @swagger
 * /api/itinerary/:tripId/day/:dayNumber:
 *   put:
 *     summary: Update a specific day in the itinerary
 *     tags: [Itinerary]
 */
router.put('/:tripId/day/:dayNumber', validate(updateItineraryDaySchema), ItineraryController.updateDay);

/**
 * @swagger
 * /api/itinerary/:tripId:
 *   delete:
 *     summary: Delete an itinerary
 *     tags: [Itinerary]
 */
router.delete('/:tripId', ItineraryController.delete);

/**
 * @swagger
 * /api/itinerary/:tripId/regenerate:
 *   post:
 *     summary: Regenerate itinerary with feedback
 *     tags: [Itinerary]
 */
router.post('/:tripId/regenerate', validate(regenerateItinerarySchema), ItineraryController.regenerate);

export default router;
