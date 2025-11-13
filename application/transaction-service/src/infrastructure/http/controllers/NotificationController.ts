import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { GetNotificationsUseCase } from '../../../application/use-cases/notification/GetNotificationsUseCase';
import { MarkAsReadUseCase } from '../../../application/use-cases/notification/MarkAsReadUseCase';

export class NotificationController {
  constructor(
    private getNotificationsUseCase: GetNotificationsUseCase,
    private markAsReadUseCase: MarkAsReadUseCase
  ) {}

  async getNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const notifications = await this.getNotificationsUseCase.execute(userId, limit);

      res.status(200).json({
        status: 'success',
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await this.markAsReadUseCase.execute(userId, id);

      res.status(200).json({
        status: 'success',
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }
}