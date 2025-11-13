import { GetCommand, QueryCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient, Transaction } from '@pix-banking/shared';
import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';

export class DynamoDBTransactionRepository implements ITransactionRepository {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async findById(transactionId: string): Promise<Transaction | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { transactionId },
    });

    const result = await dynamoDBClient.send(command);

    if (!result.Item) {
      return null;
    }

    return Transaction.reconstitute({
      transactionId: result.Item.transactionId,
      accountId: result.Item.accountId,
      type: result.Item.type,
      amount: result.Item.amount,
      pixKey: result.Item.pixKey,
      recipientName: result.Item.recipientName,
      description: result.Item.description,
      status: result.Item.status,
      createdAt: new Date(result.Item.createdAt),
      settledAt: result.Item.settledAt ? new Date(result.Item.settledAt) : undefined,
    });
  }

  async findPendingSettlements(limit: number = 50): Promise<Transaction[]> {
    // Using scan for simplicity - in production, use GSI with status as partition key
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'AWAITING_SETTLEMENT',
      },
      Limit: limit,
    });

    const result = await dynamoDBClient.send(command);

    if (!result.Items || result.Items.length === 0) {
      return [];
    }

    return result.Items.map(item =>
      Transaction.reconstitute({
        transactionId: item.transactionId,
        accountId: item.accountId,
        type: item.type,
        amount: item.amount,
        pixKey: item.pixKey,
        recipientName: item.recipientName,
        description: item.description,
        status: item.status,
        createdAt: new Date(item.createdAt),
        settledAt: item.settledAt ? new Date(item.settledAt) : undefined,
      })
    );
  }

  async findByStatus(status: string, limit: number = 100): Promise<Transaction[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
      },
      Limit: limit,
    });

    const result = await dynamoDBClient.send(command);

    if (!result.Items || result.Items.length === 0) {
      return [];
    }

    return result.Items.map(item =>
      Transaction.reconstitute({
        transactionId: item.transactionId,
        accountId: item.accountId,
        type: item.type,
        amount: item.amount,
        pixKey: item.pixKey,
        recipientName: item.recipientName,
        description: item.description,
        status: item.status,
        createdAt: new Date(item.createdAt),
        settledAt: item.settledAt ? new Date(item.settledAt) : undefined,
      })
    );
  }

  async update(transaction: Transaction): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { transactionId: transaction.transactionId },
      UpdateExpression: 'SET #status = :status, settledAt = :settledAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': transaction.status,
        ':settledAt': transaction.settledAt?.toISOString(),
      },
    });

    await dynamoDBClient.send(command);
  }
}