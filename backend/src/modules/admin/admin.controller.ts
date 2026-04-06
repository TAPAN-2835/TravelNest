import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { sendSuccess } from '../../shared/utils/response.utils';

export class AdminController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getDashboard();
      sendSuccess(res, 'Admin dashboard data fetched', data);
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getUsers(req.query);
      sendSuccess(res, 'Users list fetched', data);
    } catch (error) {
      next(error);
    }
  }

  static async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AdminService.updateUserRole(req.params.id, req.body.role);
      sendSuccess(res, 'User role updated', user);
    } catch (error) {
      next(error);
    }
  }

  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getAnalytics(req.query.period as string);
      sendSuccess(res, 'Analytics data fetched', data);
    } catch (error) {
      next(error);
    }
  }
}
