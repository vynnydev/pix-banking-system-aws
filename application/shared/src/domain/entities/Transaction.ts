import { v4 as uuidv4 } from 'uuid';

// Renomear o type local para evitar conflito
export type TransactionType = 'PIX_OUT' | 'PIX_IN';
export type TransactionStatusEnum = 'CREATED' | 'AWAITING_SETTLEMENT' | 'SETTLED' | 'FAILED';

export interface TransactionProps {
  transactionId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  pixKey: string;
  recipientName?: string;
  description?: string;
  status: TransactionStatusEnum;
  createdAt: Date;
  settledAt?: Date;
}

export class Transaction {
  private props: TransactionProps;

  private constructor(props: TransactionProps) {
    this.props = props;
  }

  static create(data: {
    accountId: string;
    type: TransactionType;
    amount: number;
    pixKey: string;
    description?: string;
  }): Transaction {
    return new Transaction({
      transactionId: uuidv4(),
      accountId: data.accountId,
      type: data.type,
      amount: data.amount,
      pixKey: data.pixKey,
      description: data.description,
      status: 'CREATED',
      createdAt: new Date(),
    });
  }

  static reconstitute(props: TransactionProps): Transaction {
    return new Transaction(props);
  }

  get transactionId(): string {
    return this.props.transactionId;
  }

  get accountId(): string {
    return this.props.accountId;
  }

  get type(): TransactionType {
    return this.props.type;
  }

  get amount(): number {
    return this.props.amount;
  }

  get pixKey(): string {
    return this.props.pixKey;
  }

  get status(): TransactionStatusEnum {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get settledAt(): Date | undefined {
    return this.props.settledAt;
  }

  markAsAwaitingSettlement(): void {
    this.props.status = 'AWAITING_SETTLEMENT';
  }

  settle(): void {
    this.props.status = 'SETTLED';
    this.props.settledAt = new Date();
  }

  fail(): void {
    this.props.status = 'FAILED';
  }

  toJSON() {
    return {
      transactionId: this.props.transactionId,
      accountId: this.props.accountId,
      type: this.props.type,
      amount: this.props.amount,
      pixKey: this.props.pixKey,
      recipientName: this.props.recipientName,
      description: this.props.description,
      status: this.props.status,
      createdAt: this.props.createdAt.toISOString(),
      settledAt: this.props.settledAt?.toISOString(),
    };
  }
}