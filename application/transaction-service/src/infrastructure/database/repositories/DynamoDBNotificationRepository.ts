import { PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
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

  async findByUserId(userId: string, limit: number = 20): Promise<Notification[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      Limit: limit,
      ScanIndexForward: false, // Descending order (newest first)
    });

    const result = await dynamoDBClient.send(command);

    if (!result.Items || result.Items.length === 0) {
      return [];
    }

    return result.Items.map(item =>
      Notification.reconstitute({
        notificationId: item.notificationId,
        userId: item.userId,
        type: item.type,
        title: item.title,
        message: item.message,
        read: item.read,
        metadata: item.metadata,
        createdAt: new Date(item.timestamp),
      })
    );
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    // First find the notification to get the timestamp (sort key)
    const queryCommand = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: 'notificationId = :notificationId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':notificationId': notificationId,
      },
      Limit: 1,
    });

    const result = await dynamoDBClient.send(queryCommand);

    if (!result.Items || result.Items.length === 0) {
      return;
    }

    const updateCommand = new UpdateCommand({
      TableName: this.tableName,
      Key: {
        userId,
        timestamp: result.Items[0].timestamp,
      },
      UpdateExpression: 'SET #read = :read',
      ExpressionAttributeNames: {
        '#read': 'read',
      },
      ExpressionAttributeValues: {
        ':read': true,
      },
    });

    await dynamoDBClient.send(updateCommand);
  }
}