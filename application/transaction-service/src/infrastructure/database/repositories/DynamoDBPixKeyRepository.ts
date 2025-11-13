import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient, PixKey } from '@pix-banking/shared';
import { IPixKeyRepository } from '../../../domain/repositories/IPixKeyRepository';

export class DynamoDBPixKeyRepository implements IPixKeyRepository {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
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

    return result.Items.map((item: any) =>
      PixKey.reconstitute({
        pixKeyId: item.pixKeyId,
        accountId: item.accountId,
        pixKey: item.pixKey,
        pixKeyType: item.pixKeyType,
        status: item.status,
        createdAt: new Date(item.createdAt),
      })
    );
  }
}