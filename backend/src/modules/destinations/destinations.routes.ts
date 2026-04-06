import { Router } from 'express';
import { DestinationsController } from './destinations.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createDestinationSchema, updateDestinationSchema } from './destinations.schema';

const router = Router();

/**
 * @swagger
 * /api/destinations:
 *   get:
 *     summary: List all destinations
 *     tags: [Destinations]
 */
router.get('/', DestinationsController.getAll);

/**
 * @swagger
 * /api/destinations/trending:
 *   get:
 *     summary: Get trending destinations
 *     tags: [Destinations]
 */
router.get('/trending', DestinationsController.getTrending);

/**
 * @swagger
 * /api/destinations/recommended:
 *   get:
 *     summary: Get recommended destinations for user
 *     tags: [Destinations]
 */
router.get('/recommended', authenticate, DestinationsController.getRecommended);

/**
 * @swagger
 * /api/destinations/:id:
 *   get:
 *     summary: Get single destination
 *     tags: [Destinations]
 */
router.get('/:id', DestinationsController.getById);

/**
 * @swagger
 * /api/destinations:
 *   post:
 *     summary: Create new destination
 *     tags: [Destinations]
 */
router.post('/', authenticate, authorize('ADMIN'), validate(createDestinationSchema), DestinationsController.create);

/**
 * @swagger
 * /api/destinations/:id:
 *   put:
 *     summary: Update destination
 *     tags: [Destinations]
 */
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateDestinationSchema), DestinationsController.update);

export default router;
