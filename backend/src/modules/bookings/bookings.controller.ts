import { Response, NextFunction } from 'express';
import { BookingsService } from './bookings.service';
import { sendSuccess } from '../../shared/utils/response.utils';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class BookingsController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bookings = await BookingsService.getAll(req.user!.id, req.query);
      sendSuccess(res, 'Bookings fetched successfully', bookings);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = await BookingsService.create(req.user!.id, req.body);
      sendSuccess(res, 'Booking created successfully', booking, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = await BookingsService.getById(req.user!.id, req.params.id);
      sendSuccess(res, 'Booking details fetched', booking);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = await BookingsService.update(req.user!.id, req.params.id, req.body);
      sendSuccess(res, 'Booking updated successfully', booking);
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = await BookingsService.cancel(req.user!.id, req.params.id);
      sendSuccess(res, 'Booking cancelled successfully', booking);
    } catch (error) {
      next(error);
    }
  }
}
