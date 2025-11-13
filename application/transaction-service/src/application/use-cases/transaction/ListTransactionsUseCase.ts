import { NotFoundError } from '@pix-banking/shared';
import { ITransactionRepository, TransactionFilters } from '../../../domain/repositories/ITransactionRepository';
import { IAccountRepository } from '../../../domain/repositories/IAccountRepository';
import { ListTransactionsDTO } from '../../dtos/ListTransactionsDTO';

export class ListTransactionsUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private accountRepository: IAccountRepository
  ) {}

  async execute(userId: string, dto: ListTransactionsDTO): Promise<any> {
    // Find user's account
    const account = await this.accountRepository.findByUserId(userId);
    if (!account) {
      throw new NotFoundError('Account not found');
    }

    // Parse filters
    const limit = parseInt(dto.limit);
    const filters: TransactionFilters = {
      accountId: account.accountId,
      status: dto.status,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      limit,
    };

    // Get transactions
    const result = await this.transactionRepository.findByAccountId(filters);

    return {
      transactions: result.transactions.map(t => t.toJSON()),
      pagination: {
        limit,
        hasMore: !!result.lastEvaluatedKey,
      },
    };
  }
}