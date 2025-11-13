import { NotFoundError } from '@pix-banking/shared';
import { IAccountRepository } from '../../../domain/repositories/IAccountRepository';

export class GetBalanceUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(userId: string): Promise<{ balance: number; currency: string }> {
    const account = await this.accountRepository.findByUserId(userId);
    if (!account) {
      throw new NotFoundError('Account not found');
    }

    return {
      balance: account.balance,
      currency: 'BRL',
    };
  }
}