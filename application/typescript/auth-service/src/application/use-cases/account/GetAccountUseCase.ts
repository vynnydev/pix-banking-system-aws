import { NotFoundError } from '@pix-banking/shared';
import { IAccountRepository } from '../../../domain/repositories/IAccountRepository';
import { IPixKeyRepository } from '../../../domain/repositories/IPixKeyRepository';

export class GetAccountUseCase {
  constructor(
    private accountRepository: IAccountRepository,
    private pixKeyRepository: IPixKeyRepository
  ) {}

  async execute(userId: string): Promise<any> {
    const account = await this.accountRepository.findByUserId(userId);
    if (!account) {
      throw new NotFoundError('Account not found');
    }

    const pixKeys = await this.pixKeyRepository.findByAccountId(account.accountId);

    return {
      ...account.toJSON(),
      pixKeys: pixKeys.map(pk => pk.toJSON()),
    };
  }
}