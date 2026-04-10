import { Request, Response, NextFunction } from 'express';
import { ItineraryService } from './itinerary.service';
import { sendSuccess } from '../../shared/utils/response.utils';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class ItineraryController {
  static async generate(req: any, res: Response, next: NextFunction) {
    try {
      const itinerary = await ItineraryService.generate(req.user!.id, req.body);
      sendSuccess(res, 'Itinerary generated successfully', itinerary, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getByTripId(req: any, res: Response, next: NextFunction) {
    try {
      const itinerary = await ItineraryService.getByTripId(req.params.tripId);
      sendSuccess(res, 'Itinerary details fetched', itinerary);
    } catch (error) {
      next(error);
    }
  }

  static async updateDay(req: any, res: Response, next: NextFunction) {
    try {
      const itinerary = await ItineraryService.updateDay(
        req.params.tripId,
        Number(req.params.dayNumber),
        req.body
      );
      sendSuccess(res, 'Itinerary day updated', itinerary);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: any, res: Response, next: NextFunction) {
    try {
      await ItineraryService.delete(req.params.tripId);
      sendSuccess(res, 'Itinerary deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async regenerate(req: any, res: Response, next: NextFunction) {
    try {
      const itinerary = await ItineraryService.regenerate(
        req.user!.id,
        req.params.tripId,
        req.body.feedback
      );
      sendSuccess(res, 'Itinerary regenerated successfully', itinerary);
    } catch (error) {
      next(error);
    }
  }
}
