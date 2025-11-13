import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient, Notification } from '@pix-banking/shared';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';

export class DynamoDBNotificationRepository implements INotificationRepository {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async save(notification: Notification): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        userId: notification.userId,
        timestamp: notification.createdAt.toISOString(),
        notificationId: notification.notificationId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        metadata: notification.metadata,
      },
    });

    await dynamoDBClient.send(command);
  }
}