import { PutCommand, GetCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient } from '@pix-banking/shared';
import { IPixKeyRepository } from '../../../domain/repositories/IPixKeyRepository';
import { PixKey } from '@pix-banking/shared';

export class DynamoDBPixKeyRepository implements IPixKeyRepository {
  constructor(private tableName: string) {}

  async save(pixKey: PixKey): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        pixKeyId: pixKey.pixKeyId,        // ✅ Correto
        accountId: pixKey.accountId,
        keyType: pixKey.keyType,          // ✅ Correto (não pixKeyType)
        keyValue: pixKey.keyValue,        // ✅ Correto (não pixKey)
        createdAt: pixKey.createdAt.toISOString(),
      },
    });

    await dynamoDBClient.send(command);
  }

  async findByKeyValue(keyValue: string): Promise<PixKey | null> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'keyValue-index',
      KeyConditionExpression: 'keyValue = :keyValue',
      ExpressionAttributeValues: {
        ':keyValue': keyValue,
      },
    });

    const result = await dynamoDBClient.send(command);

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    const item = result.Items[0];

    return PixKey.reconstitute({
      pixKeyId: item.pixKeyId,
      accountId: item.accountId,
      keyType: item.keyType,
      keyValue: item.keyValue,
      createdAt: new Date(item.createdAt),
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

    if (!result.Items) {
      return [];
    }

    return result.Items.map((item) =>
      PixKey.reconstitute({
        pixKeyId: item.pixKeyId,
        accountId: item.accountId,
        keyType: item.keyType,
        keyValue: item.keyValue,
        createdAt: new Date(item.createdAt),
      })
    );
  }

  async findByKey(keyValue: string): Promise<PixKey | null> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'keyValue-index',
      KeyConditionExpression: 'keyValue = :keyValue',
      ExpressionAttributeValues: {
        ':keyValue': keyValue,
      },
    });
  
    const result = await dynamoDBClient.send(command);
  
    if (!result.Items || result.Items.length === 0) {
      return null;
    }
  
    const item = result.Items[0];
  
    return PixKey.reconstitute({
      pixKeyId: item.pixKeyId,
      accountId: item.accountId,
      keyType: item.keyType,
      keyValue: item.keyValue,
      createdAt: new Date(item.createdAt),
    });
  }

  async delete(pixKeyId: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: { pixKeyId },
    });

    await dynamoDBClient.send(command);
  }
}