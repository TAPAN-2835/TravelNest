import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../shared/utils/jwt.utils';
import { AppError } from '../shared/utils/response.utils';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT AUTH ERROR:', error);
    next(new AppError('Invalid or expired token', 401));
  }
};
