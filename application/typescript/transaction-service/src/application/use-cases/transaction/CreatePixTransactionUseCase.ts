import { Transaction, ValidationError, NotFoundError, Money, logger } from '@pix-banking/shared';
import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import { IAccountRepository } from '../../../domain/repositories/IAccountRepository';
import { IPixKeyRepository } from '../../../domain/repositories/IPixKeyRepository';
import { IEventPublisher } from '../../../domain/services/IEventPublisher';
import { TransactionCreatedEvent } from '../../../domain/events/TransactionCreatedEvent';
import { PixReceivedEvent } from '../../../domain/events/PixReceivedEvent';
import { CreatePixTransactionDTO } from '../../dtos/CreatePixTransactionDTO';

export class CreatePixTransactionUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private accountRepository: IAccountRepository,
    private pixKeyRepository: IPixKeyRepository,
    private eventPublisher: IEventPublisher
  ) {}

  async execute(userId: string, dto: CreatePixTransactionDTO): Promise<any> {
    // Find sender's account
    const senderAccount = await this.accountRepository.findByUserId(userId);
    if (!senderAccount) {
      throw new NotFoundError('Account not found');
    }

    // Validate amount using Money value object
    const transactionAmount = new Money(dto.amount);

    // Check if sender has sufficient balance
    if (senderAccount.balance < transactionAmount.getValue()) {
      throw new ValidationError('Insufficient balance');
    }

    // Find recipient's PIX key
    const recipientPixKey = await this.pixKeyRepository.findByKey(dto.pixKey);
    if (!recipientPixKey) {
      throw new NotFoundError('PIX key not found');
    }

    // Get recipient's account
    const recipientAccount = await this.accountRepository.findById(recipientPixKey.accountId);
    if (!recipientAccount) {
      throw new NotFoundError('Recipient account not found');
    }

    // Don't allow self-transfer
    if (senderAccount.accountId === recipientAccount.accountId) {
      throw new ValidationError('Cannot transfer to yourself');
    }

    // Create transaction
    const transaction = Transaction.create({
      accountId: senderAccount.accountId,
      type: 'PIX_OUT',
      amount: transactionAmount.getValue(),
      pixKey: dto.pixKey,
      description: dto.description,
    });

    // Debit sender's account
    senderAccount.debit(transactionAmount.getValue());

    // Mark transaction as awaiting settlement
    transaction.markAsAwaitingSettlement();

    // Save transaction and update account
    await this.transactionRepository.save(transaction);
    await this.accountRepository.update(senderAccount);

    logger.info('PIX transaction created', {
      transactionId: transaction.transactionId,
      amount: dto.amount,
      sender: senderAccount.accountId,
      recipient: recipientAccount.accountId,
    });

    // Publish event for settlement processing
    const transactionEvent = new TransactionCreatedEvent({
      transactionId: transaction.transactionId,
      accountId: senderAccount.accountId,
      recipientAccountId: recipientAccount.accountId,
      type: transaction.type,
      amount: transaction.amount,
      pixKey: dto.pixKey,
      status: transaction.status,
    });

    await this.eventPublisher.publish(transactionEvent);

    // Publish event for recipient notification
    const pixReceivedEvent = new PixReceivedEvent({
      transactionId: transaction.transactionId,
      recipientAccountId: recipientAccount.accountId,
      recipientUserId: recipientAccount.userId,
      senderPixKey: dto.pixKey,
      amount: transaction.amount,
    });

    await this.eventPublisher.publish(pixReceivedEvent);

    return transaction.toJSON();
  }
}