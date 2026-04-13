import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { sendSuccess } from '../../shared/utils/response.utils';

export class AdminController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getStats();
      sendSuccess(res, 'Stats fetched successfully', data);
    } catch (error) { next(error); }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getUsers(req.query);
      sendSuccess(res, 'Users fetched successfully', result.users, 200, {
        total: result.total, page: result.page, limit: result.limit,
      });
    } catch (error) { next(error); }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AdminService.getUserById(req.params.id);
      sendSuccess(res, 'User fetched successfully', user);
    } catch (error) { next(error); }
  }

  static async getTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getTrips(req.query);
      sendSuccess(res, 'Trips fetched successfully', result.trips, 200, {
        total: result.total, page: result.page, limit: result.limit,
      });
    } catch (error) { next(error); }
  }

  // ── Legacy ────────────────────────────────────────────────────────────────
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getDashboard();
      sendSuccess(res, 'Dashboard data fetched', data);
    } catch (error) { next(error); }
  }

  static async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AdminService.updateUserRole(req.params.id, req.body.role);
      sendSuccess(res, 'User role updated', user);
    } catch (error) { next(error); }
  }

  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getAnalytics();
      sendSuccess(res, 'Analytics fetched', data);
    } catch (error) { next(error); }
  }
}
