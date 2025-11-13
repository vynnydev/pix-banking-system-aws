import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createRoutes } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { TransactionController } from './controllers/TransactionController';
import { NotificationController } from './controllers/NotificationController';
import { logger } from '@pix-banking/shared';

export const createServer = (
  transactionController: TransactionController,
  notificationController: NotificationController
): Application => {
  const app = express();

  // Security middlewares
  app.use(helmet());
  app.use(cors());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  });
  app.use(limiter);

  // Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  // Routes
  app.use('/api/v1', createRoutes(transactionController, notificationController));

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};