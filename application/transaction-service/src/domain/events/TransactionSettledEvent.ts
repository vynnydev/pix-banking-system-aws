import { v4 as uuidv4 } from 'uuid';

export class TransactionSettledEvent {
  public readonly eventType = 'TRANSACTION_SETTLED';
  public readonly eventId: string;
  public readonly timestamp: string;
  public readonly data: {
    transactionId: string;
    accountId: string;
    recipientAccountId?: string;
    amount: number;
    settledAt: string;
  };

  constructor(data: {
    transactionId: string;
    accountId: string;
    recipientAccountId?: string;
    amount: number;
    settledAt: string;
  }) {
    this.eventId = uuidv4();
    this.timestamp = new Date().toISOString();
    this.data = data;
  }
}