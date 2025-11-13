import { Notification } from '@pix-banking/shared';

export interface INotificationRepository {
  save(notification: Notification): Promise<void>;
}