import { Request, Response, NextFunction } from 'express';
import { AppError, sendError } from '../shared/utils/response.utils';
import winston from 'winston';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  } else {
    winston.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  }

  // Prisma Error Handling
  if (err.code === 'P2002') {
    return sendError(res, 'Record already exists', 409);
  }
  if (err.code === 'P2025') {
    return sendError(res, 'Record not found', 404);
  }

  // JWT Error Handling
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 401);
  }

  return sendError(res, err.message, err.statusCode, err.errors || []);
};
