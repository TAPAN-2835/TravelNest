"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsController = void 0;
const reviews_service_1 = require("./reviews.service");
const response_utils_1 = require("../../shared/utils/response.utils");
class ReviewsController {
    static async getByDestination(req, res, next) {
        try {
            const data = await reviews_service_1.ReviewsService.getByDestination(req.params.destinationId, req.query);
            (0, response_utils_1.sendSuccess)(res, 'Reviews fetched successfully', data);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const review = await reviews_service_1.ReviewsService.create(req.user.id, req.body);
            (0, response_utils_1.sendSuccess)(res, 'Review created successfully', review, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyReviews(req, res, next) {
        try {
            const reviews = await reviews_service_1.ReviewsService.getMyReviews(req.user.id);
            (0, response_utils_1.sendSuccess)(res, 'User reviews fetched', reviews);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            await reviews_service_1.ReviewsService.delete(req.user.id, req.params.id, req.user.role === 'ADMIN');
            (0, response_utils_1.sendSuccess)(res, 'Review deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReviewsController = ReviewsController;
//# sourceMappingURL=reviews.controller.js.map