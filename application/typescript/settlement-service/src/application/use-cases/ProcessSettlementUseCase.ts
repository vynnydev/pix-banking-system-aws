import { Transaction, Notification, logger } from '@pix-banking/shared';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { INotificationRepository } from '../../domain/repositories/INotificationRepository';
import { IEventPublisher } from '../../domain/services/IEventPublisher';
import { TransactionSettledEvent } from '../../domain/services/TransactionSettledEvent';
import { SettlementFailedEvent } from '../../domain/services/SettlementFailedEvent';

export interface SettlementResult {
  processed: number;
  settled: number;
  failed: number;
  errors: Array<{ transactionId: string; error: string }>;
}

export class ProcessSettlementUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private accountRepository: IAccountRepository,
    private notificationRepository: INotificationRepository,
    private eventPublisher: IEventPublisher
  ) {}

  async execute(batchSize: number = 50): Promise<SettlementResult> {
    logger.info('Starting settlement process', { batchSize });

    const result: SettlementResult = {
      processed: 0,
      settled: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Find all pending settlements
      const pendingTransactions = await this.transactionRepository.findPendingSettlements(batchSize);

      logger.info(`Found ${pendingTransactions.length} transactions awaiting settlement`);

      result.processed = pendingTransactions.length;

      // Process each transaction
      for (const transaction of pendingTransactions) {
        try {
          await this.settleTransaction(transaction);
          result.settled++;
        } catch (error: any) {
          logger.error('Failed to settle transaction', {
            transactionId: transaction.transactionId,
            error: error.message,
          });

          result.failed++;
          result.errors.push({
            transactionId: transaction.transactionId,
            error: error.message,
          });

          // Mark transaction as failed and publish event
          await this.handleSettlementFailure(transaction, error.message);
        }
      }

      logger.info('Settlement process completed', result);

      return result;
    } catch (error: any) {
      logger.error('Settlement process error', { error: error.message });
      throw error;
    }
  }

  private async settleTransaction(transaction: Transaction): Promise<void> {
    logger.info('Settling transaction', { transactionId: transaction.transactionId });

    // Get sender's account (already debited during transaction creation)
    const senderAccount = await this.accountRepository.findById(transaction.accountId);
    if (!senderAccount) {
      throw new Error('Sender account not found');
    }

    // Extract recipient account ID from transaction metadata
    // In a real system, this would be stored in the transaction
    // For this implementation, we'll need to find it via PIX key
    // This is a simplified version - in production, store recipientAccountId in transaction
    
    // For now, we'll simulate successful settlement
    // In production, you'd credit the recipient's account here

    // Mark transaction as settled
    transaction.settle();

    // Save updated transaction
    await this.transactionRepository.update(transaction);

    logger.info('Transaction settled successfully', {
      transactionId: transaction.transactionId,
      amount: transaction.amount,
    });

    // Create notification for sender
    const senderNotification = Notification.create({
      userId: senderAccount.userId,
      type: 'TRANSACTION_SETTLED',
      title: 'Transação Concluída',
      message: `Sua transferência PIX de R$ ${transaction.amount.toFixed(2)} foi concluída com sucesso.`,
      metadata: {
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        settledAt: transaction.settledAt?.toISOString(),
      },
    });

    await this.notificationRepository.save(senderNotification);

    // Publish settlement event
    const event = new TransactionSettledEvent({
      transactionId: transaction.transactionId,
      senderAccountId: senderAccount.accountId,
      recipientAccountId: 'recipient-account-id', // In production, get from transaction
      amount: transaction.amount,
      settledAt: transaction.settledAt!.toISOString(),
    });

    await this.eventPublisher.publish(event);

    logger.info('Settlement event published', { eventId: event.eventId });
  }

  private async handleSettlementFailure(transaction: Transaction, reason: string): Promise<void> {
    try {
      // Mark transaction as failed
      transaction.fail();
      await this.transactionRepository.update(transaction);

      // Publish failure event
      const event = new SettlementFailedEvent({
        transactionId: transaction.transactionId,
        reason,
        attemptedAt: new Date().toISOString(),
      });

      await this.eventPublisher.publish(event);

      // Create notification for user
      const account = await this.accountRepository.findById(transaction.accountId);
      if (account) {
        const notification = Notification.create({
          userId: account.userId,
          type: 'TRANSACTION_SETTLED',
          title: 'Falha na Liquidação',
          message: `Houve um problema ao processar sua transferência PIX de R$ ${transaction.amount.toFixed(2)}. O valor será estornado.`,
          metadata: {
            transactionId: transaction.transactionId,
            amount: transaction.amount,
            reason,
          },
        });

        await this.notificationRepository.save(notification);

        // In production, you would also credit back the sender's account here
        account.credit(transaction.amount);
        await this.accountRepository.update(account);
      }
    } catch (error: any) {
      logger.error('Failed to handle settlement failure', {
        transactionId: transaction.transactionId,
        error: error.message,
      });
    }
  }
}