import { NotFoundError, ValidationError } from '@pix-banking/shared';
import { IAccountRepository } from '../../../domain/repositories/IAccountRepository';
import { IPixKeyRepository } from '../../../domain/repositories/IPixKeyRepository';

export class RemovePixKeyUseCase {
  constructor(
    private accountRepository: IAccountRepository,
    private pixKeyRepository: IPixKeyRepository
  ) {}

  async execute(userId: string, pixKeyId: string): Promise<void> {
    // Find user's account
    const account = await this.accountRepository.findByUserId(userId);
    if (!account) {
      throw new ValidationError('Account not found');
    }

    // Find PIX key
    const pixKeys = await this.pixKeyRepository.findByAccountId(account.accountId);
    const pixKey = pixKeys.find(pk => pk.pixKeyId === pixKeyId);

    if (!pixKey) {
      throw new NotFoundError('PIX key not found');
    }

    // Ensure at least one PIX key remains
    if (pixKeys.length === 1) {
      throw new ValidationError('Cannot remove the last PIX key');
    }

    // Delete PIX key
    await this.pixKeyRepository.delete(pixKeyId);
  }
}