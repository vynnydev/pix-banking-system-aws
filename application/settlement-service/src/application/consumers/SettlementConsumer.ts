import { logger } from '@pix-banking/shared';
import { ProcessSettlementUseCase } from '../use-cases/ProcessSettlementUseCase';

export class SettlementConsumer {
  constructor(
    private processSettlementUseCase: ProcessSettlementUseCase,
    private batchSize: number = 50
  ) {}

  async handleMessage(message: any): Promise<void> {
    logger.info('Received settlement message', { message });

    try {
      // Check message type
      if (message.eventType === 'TRANSACTION_CREATED') {
        logger.info('Processing transaction created event', {
          transactionId: message.data.transactionId,
        });

        // Trigger settlement process
        const result = await this.processSettlementUseCase.execute(this.batchSize);

        logger.info('Settlement processing completed', result);
      } else {
        logger.warn('Unknown message type', { eventType: message.eventType });
      }
    } catch (error: any) {
      logger.error('Error handling settlement message', {
        error: error.message,
        message,
      });
      throw error;
    }
  }

  async processBatch(): Promise<void> {
    logger.info('Processing settlement batch (scheduled)');

    try {
      const result = await this.processSettlementUseCase.execute(this.batchSize);
      logger.info('Scheduled settlement completed', result);
    } catch (error: any) {
      logger.error('Error in scheduled settlement', { error: error.message });
      throw error;
    }
  }
}