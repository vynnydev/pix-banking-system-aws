import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { logger } from '../../utils/logger';

export class SQSConsumer {
  private sqsClient: SQSClient;
  private queueUrl: string;

  constructor(queueUrl: string) {
    this.sqsClient = new SQSClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.queueUrl = queueUrl;
  }

  async poll(handler: (message: any) => Promise<void>): Promise<void> {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
      });

      const response = await this.sqsClient.send(command);

      if (response.Messages) {
        for (const message of response.Messages) {
          try {
            const body = JSON.parse(message.Body || '{}');
            const eventData = JSON.parse(body.Message || '{}');
            
            await handler(eventData);

            await this.deleteMessage(message.ReceiptHandle!);
          } catch (error) {
            logger.error('Failed to process SQS message', { error, message });
          }
        }
      }
    } catch (error) {
      logger.error('Failed to poll SQS queue', { error });
      throw error;
    }
  }

  private async deleteMessage(receiptHandle: string): Promise<void> {
    const command = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    });

    await this.sqsClient.send(command);
  }

  async startPolling(handler: (message: any) => Promise<void>): Promise<void> {
    logger.info(`Starting SQS polling on queue: ${this.queueUrl}`);
    
    while (true) {
      await this.poll(handler);
    }
  }
}