import { Request, Response, NextFunction } from 'express';
import { ReviewsService } from './reviews.service';
import { sendSuccess } from '../../shared/utils/response.utils';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class ReviewsController {
  static async getByDestination(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReviewsService.getByDestination(req.params.destinationId, req.query);
      sendSuccess(res, 'Reviews fetched successfully', data);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const review = await ReviewsService.create(req.user!.id, req.body);
      sendSuccess(res, 'Review created successfully', review, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMyReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reviews = await ReviewsService.getMyReviews(req.user!.id);
      sendSuccess(res, 'User reviews fetched', reviews);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await ReviewsService.delete(req.user!.id, req.params.id, req.user!.role === 'ADMIN');
      sendSuccess(res, 'Review deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
