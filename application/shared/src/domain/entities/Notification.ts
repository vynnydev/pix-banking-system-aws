import { v4 as uuidv4 } from 'uuid';

export type NotificationType = 'PIX_RECEIVED' | 'PIX_SENT' | 'TRANSACTION_SETTLED' | 'ACCOUNT_UPDATE';

export interface NotificationProps {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export class Notification {
  private props: NotificationProps;

  private constructor(props: NotificationProps) {
    this.props = props;
  }

  static create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }): Notification {
    return new Notification({
      notificationId: uuidv4(),
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      read: false,
      metadata: data.metadata,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: NotificationProps): Notification {
    return new Notification(props);
  }

  get notificationId(): string {
    return this.props.notificationId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get type(): NotificationType {
    return this.props.type;
  }

  get title(): string {
    return this.props.title;
  }

  get message(): string {
    return this.props.message;
  }

  get read(): boolean {
    return this.props.read;
  }

  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  markAsRead(): void {
    this.props.read = true;
  }

  toJSON() {
    return {
      notificationId: this.props.notificationId,
      userId: this.props.userId,
      type: this.props.type,
      title: this.props.title,
      message: this.props.message,
      read: this.props.read,
      metadata: this.props.metadata,
      createdAt: this.props.createdAt.toISOString(),
    };
  }
}