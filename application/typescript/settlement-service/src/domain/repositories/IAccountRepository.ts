import { Account } from '@pix-banking/shared';

export interface IAccountRepository {
  findById(accountId: string): Promise<Account | null>;
  update(account: Account): Promise<void>;
}