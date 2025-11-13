import { PutCommand, GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient, Transaction } from '@pix-banking/shared';
import { ITransactionRepository, TransactionFilters } from '../../../domain/repositories/ITransactionRepository';

export class DynamoDBTransactionRepository implements ITransactionRepository {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async save(transaction: Transaction): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        transactionId: transaction.transactionId,
        accountId: transaction.accountId,
        type: transaction.type,
        amount: transaction.amount,
        pixKey: transaction.pixKey,
        status: transaction.status,
        createdAt: transaction.createdAt.toISOString(),
        settledAt: transaction.settledAt?.toISOString(),
      },
    });

    await dynamoDBClient.send(command);
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

  async findByAccountId(filters: TransactionFilters): Promise<{
    transactions: Transaction[];
    lastEvaluatedKey?: any;
  }> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'accountId-createdAt-index',
      KeyConditionExpression: 'accountId = :accountId',
      ExpressionAttributeValues: {
        ':accountId': filters.accountId,
      },
      Limit: filters.limit || 20,
      ScanIndexForward: false, // Descending order
    });

    const result = await dynamoDBClient.send(command);

    const transactions = (result.Items || []).map(item =>
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

    return {
      transactions,
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
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

  async findPendingSettlements(): Promise<Transaction[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'status-createdAt-index',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'AWAITING_SETTLEMENT',
      },
      Limit: 100,
    });

    const result = await dynamoDBClient.send(command);

    return (result.Items || []).map(item =>
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
}