import { PixKey, ValidationError } from '@pix-banking/shared';
import { IAccountRepository } from '../../../domain/repositories/IAccountRepository';
import { IPixKeyRepository } from '../../../domain/repositories/IPixKeyRepository';
import { AddPixKeyDTO } from '../../dtos/AddPixKeyDTO';

export class AddPixKeyUseCase {
  constructor(
    private accountRepository: IAccountRepository,
    private pixKeyRepository: IPixKeyRepository
  ) {}

  async execute(userId: string, dto: AddPixKeyDTO): Promise<any> {
    // Find user's account
    const account = await this.accountRepository.findByUserId(userId);
    if (!account) {
      throw new ValidationError('Account not found');
    }

    // Check if PIX key already exists
    const existingPixKey = await this.pixKeyRepository.findByKey(dto.pixKey);
    if (existingPixKey) {
      throw new ValidationError('PIX key already registered');
    }

    // Create new PIX key
    const pixKey = PixKey.create({
      accountId: account.accountId,
      keyType: dto.pixKeyType,
      keyValue: dto.pixKey, 
    });

    // Save PIX key
    await this.pixKeyRepository.save(pixKey);

    return pixKey.toJSON();
  }
}