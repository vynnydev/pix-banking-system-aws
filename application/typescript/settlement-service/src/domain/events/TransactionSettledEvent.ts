import { DomainEvent } from '../services/IEventPublisher';

export interface TransactionSettledEventData {
  transactionId: string;
  amount: number;
  settledAt: string; // ← string ISO
}

export class TransactionSettledEvent implements DomainEvent {
  eventType: string = 'TransactionSettled';
  timestamp: string; // ← string ISO
  data: TransactionSettledEventData;

  constructor(transactionId: string, amount: number) {
    const now = new Date();
    this.timestamp = now.toISOString(); // ← Converter para string
    this.data = {
      transactionId,
      amount,
      settledAt: now.toISOString(), // ← Converter para string
    };
  }
}

export const createTransactionSettledEvent = (
  transactionId: string,
  amount: number
): TransactionSettledEvent => {
  return new TransactionSettledEvent(transactionId, amount);
};