import { PixKey } from '@pix-banking/shared';

export interface IPixKeyRepository {
  save(pixKey: PixKey): Promise<void>;
  findByKey(keyValue: string): Promise<PixKey | null>;
  findByAccountId(accountId: string): Promise<PixKey[]>;
  delete(pixKeyId: string): Promise<void>;
}