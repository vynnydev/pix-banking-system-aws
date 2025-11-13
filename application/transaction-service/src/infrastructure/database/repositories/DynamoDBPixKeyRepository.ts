import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient } from '@pix-banking/shared';
import { IPixKeyRepository } from '../../../domain/repositories/IPixKeyRepository';
import { PixKey } from '@pix-banking/shared';

export class DynamoDBPixKeyRepository implements IPixKeyRepository {
  constructor(private tableName: string) {}

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
      pixKeyId: item.pixKeyId,  // ✅ CORRETO (não pixKey)
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
        pixKeyId: item.pixKeyId,  // ✅ CORRETO (não pixKey)
        accountId: item.accountId,
        keyType: item.keyType,
        keyValue: item.keyValue,
        createdAt: new Date(item.createdAt),
      })
    );
  }
}