import { Router } from 'express';
import { ReviewsController } from './reviews.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createReviewSchema } from './reviews.schema';

const router = Router();

/**
 * @swagger
 * /api/reviews/destination/:destinationId:
 *   get:
 *     summary: Get reviews for a destination
 *     tags: [Reviews]
 */
router.get('/destination/:destinationId', ReviewsController.getByDestination);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 */
router.post('/', authenticate, validate(createReviewSchema), ReviewsController.create);

/**
 * @swagger
 * /api/reviews/my:
 *   get:
 *     summary: Get my reviews
 *     tags: [Reviews]
 */
router.get('/my', authenticate, ReviewsController.getMyReviews);

/**
 * @swagger
 * /api/reviews/:id:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 */
router.delete('/:id', authenticate, ReviewsController.delete);

export default router;
