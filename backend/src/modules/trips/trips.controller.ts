import { Response, NextFunction } from 'express';
import { TripsService } from './trips.service';
import { sendSuccess } from '../../shared/utils/response.utils';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class TripsController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trips = await TripsService.getAll(req.user!.id, req.query);
      sendSuccess(res, 'Trips fetched successfully', trips);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trip = await TripsService.create(req.user!.id, req.body);
      sendSuccess(res, 'Trip created successfully', trip, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trip = await TripsService.getById(req.user!.id, req.params.id);
      sendSuccess(res, 'Trip details fetched', trip);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trip = await TripsService.update(req.user!.id, req.params.id, req.body);
      sendSuccess(res, 'Trip updated successfully', trip);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await TripsService.delete(req.user!.id, req.params.id);
      sendSuccess(res, 'Trip deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trip = await TripsService.updateStatus(req.user!.id, req.params.id, req.body.status);
      sendSuccess(res, 'Trip status updated', trip);
    } catch (error) {
      next(error);
    }
  }
}
