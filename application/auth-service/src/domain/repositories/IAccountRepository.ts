import { Account } from '@pix-banking/shared';

export interface IAccountRepository {
  save(account: Account): Promise<void>;
  findById(accountId: string): Promise<Account | null>;
  findByUserId(userId: string): Promise<Account | null>;
  update(account: Account): Promise<void>;
}