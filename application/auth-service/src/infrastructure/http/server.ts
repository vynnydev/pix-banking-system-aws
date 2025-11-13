import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createRoutes } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { AuthController } from './controllers/AuthController';
import { AccountController } from './controllers/AccountController';
import { logger } from '@pix-banking/shared';

export const createServer = (
  authController: AuthController,
  accountController: AccountController
): Application => {
  const app = express();

  // Security middlewares
  app.use(helmet());
  app.use(cors());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
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
  app.use('/api/v1', createRoutes(authController, accountController));

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};