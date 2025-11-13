import { PutCommand, GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient, Account } from '@pix-banking/shared';
import { IAccountRepository } from '../../../domain/repositories/IAccountRepository';

export class DynamoDBAccountRepository implements IAccountRepository {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async save(account: Account): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        accountId: account.accountId,
        userId: account.userId,
        accountNumber: account.accountNumber,  // ← READICIONADO
        agency: account.agency,                // ← READICIONADO
        balance: account.balance,
        status: account.status,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString(),
      },
    });
  
    await dynamoDBClient.send(command);
  }

  async findById(accountId: string): Promise<Account | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { accountId },
    });

    const result = await dynamoDBClient.send(command);
    
    if (!result.Item) {
      return null;
    }

    return Account.reconstitute({
      accountId: result.Item.accountId,
      userId: result.Item.userId,
      accountNumber: result.Item.accountNumber,
      agency: result.Item.agency,
      balance: result.Item.balance,
      status: result.Item.status,
      createdAt: new Date(result.Item.createdAt),
      updatedAt: new Date(result.Item.updatedAt),
    });
  }

  async findByUserId(userId: string): Promise<Account | null> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    });

    const result = await dynamoDBClient.send(command);
    
    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    const item = result.Items[0];
    return Account.reconstitute({
      accountId: item.accountId,
      userId: item.userId,
      accountNumber: item.accountNumber,
      agency: item.agency,
      balance: item.balance,
      status: item.status,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    });
  }

  async update(account: Account): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { accountId: account.accountId },
      UpdateExpression: 'SET balance = :balance, #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':balance': account.balance,
        ':status': account.status,
        ':updatedAt': account.updatedAt.toISOString(),
      },
    });

    await dynamoDBClient.send(command);
  }
}