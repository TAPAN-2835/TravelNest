import { Response, NextFunction } from 'express';
import { AlertsService } from './alerts.service';
import { sendSuccess } from '../../shared/utils/response.utils';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class AlertsController {
  static async getAll(req: any, res: Response, next: NextFunction) {
    try {
      const alerts = await AlertsService.getAll(req.user!.id, req.query);
      sendSuccess(res, 'Alerts fetched successfully', alerts);
    } catch (error) {
      next(error);
    }
  }

  static async subscribe(req: any, res: Response, next: NextFunction) {
    try {
      await AlertsService.subscribe(req.user!.id, req.body.tripId);
      sendSuccess(res, 'Subscribed to alerts successfully');
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: any, res: Response, next: NextFunction) {
    try {
      const alert = await AlertsService.markAsRead(req.user!.id, req.params.id);
      sendSuccess(res, 'Alert marked as read', alert);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: any, res: Response, next: NextFunction) {
    try {
      await AlertsService.delete(req.user!.id, req.params.id);
      sendSuccess(res, 'Alert deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async broadcast(req: any, res: Response, next: NextFunction) {
    try {
      const alerts = await AlertsService.broadcast(req.body.tripIds, {
        title: req.body.title,
        message: req.body.message,
        type: req.body.type,
        severity: req.body.severity,
      });
      sendSuccess(res, 'Alerts broadcasted successfully', alerts);
    } catch (error) {
      next(error);
    }
  }
}
