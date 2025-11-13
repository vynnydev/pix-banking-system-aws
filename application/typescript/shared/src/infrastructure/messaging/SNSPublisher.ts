import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { logger } from '../../utils/logger';

export interface DomainEvent {
  eventType: string;
  eventId: string;
  timestamp: string;
  data: any;
}

export class SNSPublisher {
  private snsClient: SNSClient;
  private topicArn: string;

  constructor(topicArn: string) {
    this.snsClient = new SNSClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.topicArn = topicArn;
  }

  async publish(event: DomainEvent): Promise<void> {
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
      logger.info(`Event published to SNS: ${event.eventType}`, { eventId: event.eventId });
    } catch (error) {
      logger.error('Failed to publish event to SNS', { error, event });
      throw error;
    }
  }
}