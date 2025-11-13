import { v4 as uuidv4 } from 'uuid';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'CLOSED';

export interface AccountProps {
  accountId: string;
  userId: string;
  accountNumber: string;  // ← ADICIONADO
  agency: string;         // ← ADICIONADO
  balance: number;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Account {
  private props: AccountProps;

  private constructor(props: AccountProps) {
    this.props = props;
  }

  static create(userId: string, accountNumber: string, agency: string = '0001'): Account {
    const now = new Date();
    return new Account({
      accountId: uuidv4(),
      userId,
      accountNumber,
      agency,
      balance: 0,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: AccountProps): Account {
    return new Account(props);
  }

  get accountId(): string {
    return this.props.accountId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get accountNumber(): string {
    return this.props.accountNumber;
  }

  get agency(): string {
    return this.props.agency;
  }

  get balance(): number {
    return this.props.balance;
  }

  get status(): AccountStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  credit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Credit amount must be positive');
    }
    this.props.balance += amount;
    this.props.updatedAt = new Date();
  }

  debit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Debit amount must be positive');
    }
    if (this.props.balance < amount) {
      throw new Error('Insufficient balance');
    }
    this.props.balance -= amount;
    this.props.updatedAt = new Date();
  }

  suspend(): void {
    this.props.status = 'SUSPENDED';
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.status = 'ACTIVE';
    this.props.updatedAt = new Date();
  }

  close(): void {
    if (this.props.balance !== 0) {
      throw new Error('Cannot close account with non-zero balance');
    }
    this.props.status = 'CLOSED';
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      accountId: this.props.accountId,
      userId: this.props.userId,
      accountNumber: this.props.accountNumber,
      agency: this.props.agency,
      balance: this.props.balance,
      status: this.props.status,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}