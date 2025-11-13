import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';

export class GetNotificationsUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(userId: string, limit: number = 20): Promise<any> {
    const notifications = await this.notificationRepository.findByUserId(userId, limit);

    return {
      notifications: notifications.map(n => n.toJSON()),
      total: notifications.length,
    };
  }
}