import { NotFoundError } from '@pix-banking/shared';
import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import { IAccountRepository } from '../../../domain/repositories/IAccountRepository';

export class GetTransactionUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private accountRepository: IAccountRepository
  ) {}

  async execute(userId: string, transactionId: string): Promise<any> {
    // Find user's account
    const account = await this.accountRepository.findByUserId(userId);
    if (!account) {
      throw new NotFoundError('Account not found');
    }

    // Find transaction
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    // Verify transaction belongs to user
    if (transaction.accountId !== account.accountId) {
      throw new NotFoundError('Transaction not found');
    }

    return transaction.toJSON();
  }
}