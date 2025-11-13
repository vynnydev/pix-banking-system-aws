export interface DomainEvent {
    eventType: string;
    eventId: string;
    timestamp: string;
    data: any;
  }
  
  export interface IEventPublisher {
    publish(event: DomainEvent): Promise<void>;
  }