import { Transaction } from '@pix-banking/shared';

export interface TransactionFilters {
  accountId: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  lastEvaluatedKey?: any;
}

export interface ITransactionRepository {
  save(transaction: Transaction): Promise<void>;
  findById(transactionId: string): Promise<Transaction | null>;
  findByAccountId(filters: TransactionFilters): Promise<{
    transactions: Transaction[];
    lastEvaluatedKey?: any;
  }>;
  update(transaction: Transaction): Promise<void>;
  findPendingSettlements(): Promise<Transaction[]>;
}