import { NotFoundError } from '@pix-banking/shared';
import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import { IAccountRepository } from '../../../domain/repositories/IAccountRepository';

export class GetStatisticsUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private accountRepository: IAccountRepository
  ) {}

  async execute(userId: string, periodDays: number = 30): Promise<any> {
    // Find user's account
    const account = await this.accountRepository.findByUserId(userId);
    if (!account) {
      throw new NotFoundError('Account not found');
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get all transactions in period
    const result = await this.transactionRepository.findByAccountId({
      accountId: account.accountId,
      startDate,
      endDate,
      limit: 1000,
    });

    const transactions = result.transactions;

    // Calculate statistics
    const totalSent = transactions
      .filter(t => t.type === 'PIX_OUT' && t.status === 'SETTLED')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalReceived = transactions
      .filter(t => t.type === 'PIX_IN' && t.status === 'SETTLED')
      .reduce((sum, t) => sum + t.amount, 0);

    const transactionCount = transactions.length;

    const averageTransaction = transactionCount > 0
      ? (totalSent + totalReceived) / transactionCount
      : 0;

    return {
      period: `${periodDays} days`,
      totalSent,
      totalReceived,
      transactionCount,
      averageTransaction: Math.round(averageTransaction * 100) / 100,
      balance: account.balance,
    };
  }
}