import { Router } from 'express';
import { createTransactionRoutes } from './transactionRoutes';
import { createNotificationRoutes } from './notificationRoutes';
import { TransactionController } from '../controllers/TransactionController';
import { NotificationController } from '../controllers/NotificationController';
import { authMiddleware } from '../middlewares/authMiddleware';

export const createRoutes = (
  transactionController: TransactionController,
  notificationController: NotificationController
): Router => {
  const router = Router();

  // All routes require authentication
  router.use(authMiddleware);

  router.use('/transactions', createTransactionRoutes(transactionController));
  router.use('/notifications', createNotificationRoutes(notificationController));

  // Health check
  router.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: 'transaction-service',
      timestamp: new Date().toISOString(),
    });
  });

  return router;
};