import { PutCommand, GetCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient, PixKey } from '@pix-banking/shared';
import { IPixKeyRepository } from '../../../domain/repositories/IPixKeyRepository';

export class DynamoDBPixKeyRepository implements IPixKeyRepository {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async save(pixKey: PixKey): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        pixKey: pixKey.pixKey,
        pixKeyId: pixKey.pixKeyId,
        accountId: pixKey.accountId,
        pixKeyType: pixKey.pixKeyType,
        status: pixKey.status,
        createdAt: pixKey.createdAt.toISOString(),
      },
    });

    await dynamoDBClient.send(command);
  }

  async findByKey(pixKey: string): Promise<PixKey | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { pixKey },
    });

    const result = await dynamoDBClient.send(command);
    
    if (!result.Item) {
      return null;
    }

    return PixKey.reconstitute({
      pixKeyId: result.Item.pixKeyId,
      accountId: result.Item.accountId,
      pixKey: result.Item.pixKey,
      pixKeyType: result.Item.pixKeyType,
      status: result.Item.status,
      createdAt: new Date(result.Item.createdAt),
    });
  }

  async findByAccountId(accountId: string): Promise<PixKey[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'accountId-index',
      KeyConditionExpression: 'accountId = :accountId',
      ExpressionAttributeValues: {
        ':accountId': accountId,
      },
    });

    const result = await dynamoDBClient.send(command);
    
    if (!result.Items || result.Items.length === 0) {
      return [];
    }

    return result.Items.map(item => PixKey.reconstitute({
      pixKeyId: item.pixKeyId,
      accountId: item.accountId,
      pixKey: item.pixKey,
      pixKeyType: item.pixKeyType,
      status: item.status,
      createdAt: new Date(item.createdAt),
    }));
  }

  async delete(pixKeyId: string): Promise<void> {
    // First find the PIX key to get the partition key
    const queryCommand = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'pixKeyId-index',
      KeyConditionExpression: 'pixKeyId = :pixKeyId',
      ExpressionAttributeValues: {
        ':pixKeyId': pixKeyId,
      },
    });

    const result = await dynamoDBClient.send(queryCommand);
    
    if (!result.Items || result.Items.length === 0) {
      return;
    }

    const deleteCommand = new DeleteCommand({
      TableName: this.tableName,
      Key: { pixKey: result.Items[0].pixKey },
    });

    await dynamoDBClient.send(deleteCommand);
  }
}