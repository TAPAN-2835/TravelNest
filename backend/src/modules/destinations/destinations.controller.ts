import { Request, Response, NextFunction } from 'express';
import { DestinationsService } from './destinations.service';
import { sendSuccess } from '../../shared/utils/response.utils';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class DestinationsController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DestinationsService.getAll(req.query);
      sendSuccess(res, 'Destinations fetched successfully', data);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const destination = await DestinationsService.getById(req.params.id);
      if (!destination) return next(new Error('Destination not found'));
      sendSuccess(res, 'Destination fetched successfully', destination);
    } catch (error) {
      next(error);
    }
  }

  static async getTrending(req: Request, res: Response, next: NextFunction) {
    try {
      const trending = await DestinationsService.getTrending();
      sendSuccess(res, 'Trending destinations fetched', trending);
    } catch (error) {
      next(error);
    }
  }

  static async getRecommended(req: any, res: Response, next: NextFunction) {
    try {
      const user = await req.user; // Simplified, ideally fetch user from DB
      const recommended = await DestinationsService.getRecommended(req.user!.role === 'USER' ? [] : []); // Logic based on travel style
      sendSuccess(res, 'Recommended destinations fetched', recommended);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const destination = await DestinationsService.create(req.body);
      sendSuccess(res, 'Destination created successfully', destination, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const destination = await DestinationsService.update(req.params.id, req.body);
      sendSuccess(res, 'Destination updated successfully', destination);
    } catch (error) {
      next(error);
    }
  }
}
