import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';

export class MarkAsReadUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async execute(userId: string, notificationId: string): Promise<void> {
    await this.notificationRepository.markAsRead(notificationId, userId);
  }
}