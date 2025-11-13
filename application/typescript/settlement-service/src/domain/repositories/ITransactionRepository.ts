import { Transaction } from '@pix-banking/shared';

export interface ITransactionRepository {
  findById(transactionId: string): Promise<Transaction | null>;
  findPendingSettlements(limit?: number): Promise<Transaction[]>;
  update(transaction: Transaction): Promise<void>;
  findByStatus(status: string, limit?: number): Promise<Transaction[]>;
}