import { Request, Response, NextFunction } from 'express';
import { AppError, logger } from '@pix-banking/shared';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof AppError) {
    logger.warn(`Operational error: ${error.message}`, {
      statusCode: error.statusCode,
      path: req.path,
    });

    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  logger.error('Unexpected error:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
  });

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};