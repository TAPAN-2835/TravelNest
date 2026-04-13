import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../shared/utils/response.utils';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.register(req.body);
      sendSuccess(res, 'User registered successfully', data, 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.login(req.body);
      sendSuccess(res, 'Login successful', data);
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.refreshToken(req.body.refreshToken);
      sendSuccess(res, 'Token refreshed successfully', data);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.logout(req.body.refreshToken);
      sendSuccess(res, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.forgotPassword(req.body.email);
      sendSuccess(res, 'Password reset email sent');
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.resetPassword(req.body.token, req.body.newPassword);
      sendSuccess(res, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  }

  static async me(req: any, res: Response, next: NextFunction) {
    try {
      sendSuccess(res, 'Current user profile fetched', req.user);
    } catch (error) {
      next(error);
    }
  }
}
