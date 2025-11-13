import { SQSConsumer, logger } from '@pix-banking/shared';
import { SettlementConsumer } from '../../application/consumers/SettlementConsumer';

export class SQSSettlementConsumer {
  private sqsConsumer: SQSConsumer;
  private settlementConsumer: SettlementConsumer;

  constructor(queueUrl: string, settlementConsumer: SettlementConsumer) {
    this.sqsConsumer = new SQSConsumer(queueUrl);
    this.settlementConsumer = settlementConsumer;
  }

  async start(): Promise<void> {
    logger.info('Starting SQS settlement consumer');

    await this.sqsConsumer.startPolling(async (message) => {
      await this.settlementConsumer.handleMessage(message);
    });
  }

  async pollOnce(): Promise<void> {
    logger.info('Polling SQS queue once');

    await this.sqsConsumer.poll(async (message) => {
      await this.settlementConsumer.handleMessage(message);
    });
  }
}