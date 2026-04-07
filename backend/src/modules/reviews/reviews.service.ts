import { prisma } from '../../config/database';
import { AppError } from '../../shared/utils/response.utils';
import { SQSService } from '../../shared/services/sqs.service';

export class ReviewsService {
  static async getByDestination(destinationId: string, query: any) {
    const { page = 1, limit = 10, sentiment, rating } = query;
    const where: any = { destinationId };
    if (sentiment) where.sentiment = sentiment;
    if (rating) where.rating = Number(rating);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: { user: { select: { name: true, avatar: true } } },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where }),
    ]);

    return { reviews, total, page: Number(page), limit: Number(limit) };
  }

  static async create(userId: string, data: any) {
    const review = await prisma.review.create({
      data: {
        ...data,
        userId,
        status: 'PENDING',
      },
    });

    // Push to SQS for async sentiment analysis
    await SQSService.sendMessage(process.env.SQS_REVIEW_QUEUE || 'review-sentiment-queue', {
      reviewId: review.id,
      text: data.comment,
    });

    await this.updateDestinationRating(data.destinationId);
    return review;
  }

  static async getMyReviews(userId: string) {
    return await prisma.review.findMany({
      where: { userId },
      include: { destination: true },
    });
  }

  static async delete(userId: string, id: string, isAdmin: boolean) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new AppError('Review not found', 404);

    if (review.userId !== userId && !isAdmin) {
      throw new AppError('Unauthorized', 403);
    }

    await prisma.review.delete({ where: { id } });
    await this.updateDestinationRating(review.destinationId);
  }

  private static async updateDestinationRating(destinationId: string) {
    const reviews = await prisma.review.findMany({
      where: { destinationId },
      select: { rating: true },
    });

    const avgRating = reviews.length > 0 ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length : 0;

    await prisma.destination.update({
      where: { id: destinationId },
      data: {
        rating: avgRating,
        reviewCount: reviews.length,
      },
    });
  }
}
