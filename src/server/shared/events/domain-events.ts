/** Represents who initiated the action (user, system, etc.) */
export interface Actor {
  readonly id: string;
  readonly type: string;
}

/** Represents the entity affected by the event */
export interface Subject {
  readonly id: string;
  readonly type: string;
}

/** Base interface for all domain events */
export interface DomainEvent {
  readonly id: string;
  readonly type: string;
  readonly occurredAt: Date;
  readonly actor: Actor;
  readonly subject: Subject;
  readonly payload: Record<string, unknown>;
}

/** Parameters for creating a domain event (id and occurredAt are auto-generated) */
interface CreateEventParams {
  readonly type: string;
  readonly actor: Actor;
  readonly subject: Subject;
  readonly payload: Record<string, unknown>;
}

/** Handler function that processes a domain event */
type EventHandler = (event: DomainEvent) => void;

let counter = 0;

/** Generates a unique event ID */
function generateId(): string {
  counter += 1;
  return `evt-${Date.now()}-${counter}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Factory function to create a DomainEvent with auto-generated id and occurredAt */
export function createEvent(params: CreateEventParams): DomainEvent {
  return {
    id: generateId(),
    occurredAt: new Date(),
    type: params.type,
    actor: params.actor,
    subject: params.subject,
    payload: params.payload,
  };
}

/** In-memory domain event bus supporting publish/subscribe/clear */
export const DomainEvents = (() => {
  let subscribers = new Map<string, Set<EventHandler>>();

  return {
    /**
     * Subscribe to events of a specific type.
     * Use "*" to subscribe to all event types.
     * Returns an unsubscribe function.
     */
    subscribe(eventType: string, handler: EventHandler): () => void {
      if (!subscribers.has(eventType)) {
        subscribers.set(eventType, new Set());
      }
      subscribers.get(eventType)!.add(handler);

      return (): void => {
        const handlers = subscribers.get(eventType);
        if (handlers) {
          handlers.delete(handler);
          if (handlers.size === 0) {
            subscribers.delete(eventType);
          }
        }
      };
    },

    /** Publish a domain event to all matching subscribers */
    publish(event: DomainEvent): void {
      const typeHandlers = subscribers.get(event.type);
      if (typeHandlers) {
        for (const handler of typeHandlers) {
          handler(event);
        }
      }

      const wildcardHandlers = subscribers.get('*');
      if (wildcardHandlers) {
        for (const handler of wildcardHandlers) {
          handler(event);
        }
      }
    },

    /** Remove all subscribers (useful for testing) */
    clear(): void {
      subscribers = new Map<string, Set<EventHandler>>();
    },
  };
})();
