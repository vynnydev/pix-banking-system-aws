import { SNSPublisher } from '@pix-banking/shared';
import { IEventPublisher, DomainEvent } from '../../domain/services/IEventPublisher';

export class SNSEventPublisher implements IEventPublisher {
  private snsPublisher: SNSPublisher;

  constructor(topicArn: string) {
    this.snsPublisher = new SNSPublisher(topicArn);
  }

  async publish(event: DomainEvent): Promise<void> {
    await this.snsPublisher.publish(event);
  }
}