import { v4 as uuidv4 } from 'uuid';

export class TransactionCreatedEvent {
  public readonly eventType = 'TRANSACTION_CREATED';
  public readonly eventId: string;
  public readonly timestamp: string;
  public readonly data: {
    transactionId: string;
    accountId: string;
    recipientAccountId?: string;
    type: string;
    amount: number;
    pixKey: string;
    status: string;
  };

  constructor(data: {
    transactionId: string;
    accountId: string;
    recipientAccountId?: string;
    type: string;
    amount: number;
    pixKey: string;
    status: string;
  }) {
    this.eventId = uuidv4();
    this.timestamp = new Date().toISOString();
    this.data = data;
  }
}