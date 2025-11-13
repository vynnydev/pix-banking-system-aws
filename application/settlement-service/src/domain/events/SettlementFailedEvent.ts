import { DomainEvent } from '../services/IEventPublisher';

export interface SettlementFailedEventData {
  transactionId: string;
  reason: string;
  failedAt: string; // ← string ISO
}

export class SettlementFailedEvent implements DomainEvent {
  eventType: string = 'SettlementFailed';
  timestamp: string; // ← string ISO
  data: SettlementFailedEventData;

  constructor(transactionId: string, reason: string) {
    const now = new Date();
    this.timestamp = now.toISOString(); // ← Converter para string
    this.data = {
      transactionId,
      reason,
      failedAt: now.toISOString(), // ← Converter para string
    };
  }
}

export const createSettlementFailedEvent = (
  transactionId: string,
  reason: string
): SettlementFailedEvent => {
  return new SettlementFailedEvent(transactionId, reason);
};