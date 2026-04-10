import { Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { sendSuccess } from '../../shared/utils/response.utils';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class UsersController {
  static async getProfile(req: any, res: Response, next: NextFunction) {
    try {
      const user = await UsersService.getProfile(req.user!.id);
      sendSuccess(res, 'Profile fetched successfully', user);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: any, res: Response, next: NextFunction) {
    try {
      const user = await UsersService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, 'Profile updated successfully', user);
    } catch (error) {
      next(error);
    }
  }

  static async updateAvatar(req: any, res: Response, next: NextFunction) {
    try {
      if (!req.file) return next(new Error('No file uploaded'));
      const data = await UsersService.updateAvatar(req.user!.id, req.file.originalname, req.file.mimetype);
      sendSuccess(res, 'Avatar upload initiated', data);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req: any, res: Response, next: NextFunction) {
    try {
      await UsersService.deleteAccount(req.user!.id);
      sendSuccess(res, 'Account deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: any, res: Response, next: NextFunction) {
    try {
      const stats = await UsersService.getStats(req.user!.id);
      sendSuccess(res, 'User stats fetched successfully', stats);
    } catch (error) {
      next(error);
    }
  }
}
