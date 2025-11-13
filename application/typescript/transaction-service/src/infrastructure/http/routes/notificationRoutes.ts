import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';

export const createNotificationRoutes = (notificationController: NotificationController): Router => {
  const router = Router();

  router.get('/', (req, res, next) =>
    notificationController.getNotifications(req, res, next)
  );

  router.patch('/:id/read', (req, res, next) =>
    notificationController.markAsRead(req, res, next)
  );

  return router;
};