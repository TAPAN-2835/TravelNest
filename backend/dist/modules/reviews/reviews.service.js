"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const database_1 = require("../../config/database");
const response_utils_1 = require("../../shared/utils/response.utils");
const sqs_service_1 = require("../../shared/services/sqs.service");
class ReviewsService {
    static async getByDestination(destinationId, query) {
        const { page = 1, limit = 10, sentiment, rating } = query;
        const where = { destinationId };
        if (sentiment)
            where.sentiment = sentiment;
        if (rating)
            where.rating = Number(rating);
        const [reviews, total] = await Promise.all([
            database_1.prisma.review.findMany({
                where,
                include: { user: { select: { name: true, avatar: true } } },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            database_1.prisma.review.count({ where }),
        ]);
        return { reviews, total, page: Number(page), limit: Number(limit) };
    }
    static async create(userId, data) {
        const review = await database_1.prisma.review.create({
            data: {
                ...data,
                userId,
                status: 'PENDING',
            },
        });
        // Push to SQS for async sentiment analysis
        await sqs_service_1.SQSService.sendMessage(process.env.SQS_REVIEW_QUEUE || 'review-sentiment-queue', {
            reviewId: review.id,
            text: data.comment,
        });
        await this.updateDestinationRating(data.destinationId);
        return review;
    }
    static async getMyReviews(userId) {
        return await database_1.prisma.review.findMany({
            where: { userId },
            include: { destination: true },
        });
    }
    static async delete(userId, id, isAdmin) {
        const review = await database_1.prisma.review.findUnique({ where: { id } });
        if (!review)
            throw new response_utils_1.AppError('Review not found', 404);
        if (review.userId !== userId && !isAdmin) {
            throw new response_utils_1.AppError('Unauthorized', 403);
        }
        await database_1.prisma.review.delete({ where: { id } });
        await this.updateDestinationRating(review.destinationId);
    }
    static async updateDestinationRating(destinationId) {
        const reviews = await database_1.prisma.review.findMany({
            where: { destinationId },
            select: { rating: true },
        });
        const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
        await database_1.prisma.destination.update({
            where: { id: destinationId },
            data: {
                rating: avgRating,
                reviewCount: reviews.length,
            },
        });
    }
}
exports.ReviewsService = ReviewsService;
//# sourceMappingURL=reviews.service.js.map