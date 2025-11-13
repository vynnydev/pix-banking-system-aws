import { v4 as uuidv4 } from 'uuid';

export interface AccountProps {
  accountId: string;
  userId: string;
  accountNumber: string;
  agency: string;
  balance: number;
  status: 'ACTIVE' | 'BLOCKED' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
}

export class Account {
  private props: AccountProps;

  private constructor(props: AccountProps) {
    this.props = props;
  }

  static create(userId: string, accountNumber: string): Account {
    const now = new Date();
    return new Account({
      accountId: uuidv4(),
      userId,
      accountNumber,
      agency: '0001',
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

  get status(): string {
    return this.props.status;
  }

  credit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    this.props.balance += amount;
    this.props.updatedAt = new Date();
  }

  debit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    if (this.props.balance < amount) {
      throw new Error('Insufficient balance');
    }
    this.props.balance -= amount;
    this.props.updatedAt = new Date();
  }

  hasBalance(amount: number): boolean {
    return this.props.balance >= amount;
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