import { v4 as uuidv4 } from 'uuid';

export class PixReceivedEvent {
  public readonly eventType = 'PIX_RECEIVED';
  public readonly eventId: string;
  public readonly timestamp: string;
  public readonly data: {
    transactionId: string;
    recipientAccountId: string;
    recipientUserId: string;
    senderPixKey: string;
    amount: number;
  };

  constructor(data: {
    transactionId: string;
    recipientAccountId: string;
    recipientUserId: string;
    senderPixKey: string;
    amount: number;
  }) {
    this.eventId = uuidv4();
    this.timestamp = new Date().toISOString();
    this.data = data;
  }
}