import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient, Account } from '@pix-banking/shared';
import { IAccountRepository } from '../../../domain/repositories/IAccountRepository';

export class DynamoDBAccountRepository implements IAccountRepository {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
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