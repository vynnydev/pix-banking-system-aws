import { PixKey } from '@pix-banking/shared';

export interface IPixKeyRepository {
  findByKey(pixKey: string): Promise<PixKey | null>;
  findByAccountId(accountId: string): Promise<PixKey[]>;
}