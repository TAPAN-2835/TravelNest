"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviews_controller_1 = require("./reviews.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const reviews_schema_1 = require("./reviews.schema");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/reviews/destination/:destinationId:
 *   get:
 *     summary: Get reviews for a destination
 *     tags: [Reviews]
 */
router.get('/destination/:destinationId', reviews_controller_1.ReviewsController.getByDestination);
/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 */
router.post('/', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(reviews_schema_1.createReviewSchema), reviews_controller_1.ReviewsController.create);
/**
 * @swagger
 * /api/reviews/my:
 *   get:
 *     summary: Get my reviews
 *     tags: [Reviews]
 */
router.get('/my', auth_middleware_1.authenticate, reviews_controller_1.ReviewsController.getMyReviews);
/**
 * @swagger
 * /api/reviews/:id:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 */
router.delete('/:id', auth_middleware_1.authenticate, reviews_controller_1.ReviewsController.delete);
exports.default = router;
//# sourceMappingURL=reviews.routes.js.map