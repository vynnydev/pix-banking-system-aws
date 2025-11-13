export interface DomainEvent {
  eventType: string;
  timestamp: string;
  data: any;
}

export interface IEventPublisher {
  publish(event: DomainEvent): Promise<void>;
}