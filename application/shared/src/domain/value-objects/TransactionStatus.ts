export type TransactionStatusType = 'CREATED' | 'AWAITING_SETTLEMENT' | 'SETTLED' | 'FAILED';

export class TransactionStatus {
  private readonly value: TransactionStatusType;

  constructor(status: TransactionStatusType) {
    if (!this.isValid(status)) {
      throw new Error(`Invalid transaction status: ${status}`);
    }
    this.value = status;
  }

  private isValid(status: string): status is TransactionStatusType {
    return ['CREATED', 'AWAITING_SETTLEMENT', 'SETTLED', 'FAILED'].includes(status);
  }

  getValue(): TransactionStatusType {
    return this.value;
  }

  isCreated(): boolean {
    return this.value === 'CREATED';
  }

  isAwaitingSettlement(): boolean {
    return this.value === 'AWAITING_SETTLEMENT';
  }

  isSettled(): boolean {
    return this.value === 'SETTLED';
  }

  isFailed(): boolean {
    return this.value === 'FAILED';
  }

  canTransitionTo(newStatus: TransactionStatusType): boolean {
    const transitions: Record<TransactionStatusType, TransactionStatusType[]> = {
      CREATED: ['AWAITING_SETTLEMENT', 'FAILED'],
      AWAITING_SETTLEMENT: ['SETTLED', 'FAILED'],
      SETTLED: [],
      FAILED: [],
    };

    return transitions[this.value].includes(newStatus);
  }

  equals(other: TransactionStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}