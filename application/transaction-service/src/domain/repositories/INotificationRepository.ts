import { Notification } from '@pix-banking/shared';

export interface INotificationRepository {
  save(notification: Notification): Promise<void>;
  findByUserId(userId: string, limit?: number): Promise<Notification[]>;
  markAsRead(notificationId: string, userId: string): Promise<void>;
}