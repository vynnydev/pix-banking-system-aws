import { v4 as uuidv4 } from 'uuid';

export class SettlementFailedEvent {
  public readonly eventType = 'SETTLEMENT_FAILED';
  public readonly eventId: string;
  public readonly timestamp: string;
  public readonly data: {
    transactionId: string;
    reason: string;
    attemptedAt: string;
  };

  constructor(data: {
    transactionId: string;
    reason: string;
    attemptedAt: string;
  }) {
    this.eventId = uuidv4();
    this.timestamp = new Date().toISOString();
    this.data = data;
  }
}