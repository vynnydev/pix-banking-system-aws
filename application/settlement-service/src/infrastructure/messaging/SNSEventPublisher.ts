import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { IEventPublisher, DomainEvent } from '../../domain/services/IEventPublisher';
import { logger } from '@pix-banking/shared';

export class SNSEventPublisher implements IEventPublisher {
  private snsClient: SNSClient;
  private topicArn: string;

  constructor(region: string, topicArn: string) {
    this.snsClient = new SNSClient({ region });
    this.topicArn = topicArn;
  }

  async publish(event: DomainEvent): Promise<void> {
    if (!this.topicArn) {
      logger.warn('SNS Topic ARN not configured, skipping event publish', {
        eventType: event.eventType,
      });
      return;
    }

    try {
      const command = new PublishCommand({
        TopicArn: this.topicArn,
        Message: JSON.stringify(event),
        MessageAttributes: {
          eventType: {
            DataType: 'String',
            StringValue: event.eventType,
          },
        },
      });

      await this.snsClient.send(command);

      logger.info('Event published to SNS', {
        eventType: event.eventType,
        topicArn: this.topicArn,
      });
    } catch (error: any) {
      logger.error('Failed to publish event to SNS', {
        eventType: event.eventType,
        error: error.message,
      });
      throw error;
    }
  }
}