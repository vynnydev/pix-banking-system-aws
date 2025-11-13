import { UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient } from '@pix-banking/shared';
import { IAccountRepository } from '../../../domain/repositories/IAccountRepository';
import { Account } from '@pix-banking/shared';

export class DynamoDBAccountRepository implements IAccountRepository {
  constructor(private tableName: string) {}

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
      balance: result.Item.balance,
      status: result.Item.status,
      accountNumber: result.Item.accountNumber,
      agency: result.Item.agency,
      createdAt: new Date(result.Item.createdAt),
      updatedAt: new Date(result.Item.updatedAt),
    });
  }

  async findByUserId(userId: string): Promise<Account | null> {
    // Assumindo que existe um GSI com userId como chave
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { userId }, // Ajuste conforme seu GSI
    });

    const result = await dynamoDBClient.send(command);

    if (!result.Item) {
      return null;
    }

    return Account.reconstitute({
      accountId: result.Item.accountId,
      userId: result.Item.userId,
      balance: result.Item.balance,
      status: result.Item.status,
      accountNumber: result.Item.accountNumber,
      agency: result.Item.agency,
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
        ':updatedAt': account.updatedAt.toISOString(), // ← CORREÇÃO AQUI!
      },
    });

    await dynamoDBClient.send(command);
  }
}