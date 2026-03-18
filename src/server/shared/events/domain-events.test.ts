import { describe, it, expect, beforeEach } from 'vitest';
import {
  type Actor,
  type Subject,
  type DomainEvent,
  createEvent,
  DomainEvents,
} from './domain-events';

describe('Actor', () => {
  it('should have id and type fields', () => {
    const actor: Actor = { id: 'user-1', type: 'user' };
    expect(actor.id).toBe('user-1');
    expect(actor.type).toBe('user');
  });

  it('should accept system actor type', () => {
    const actor: Actor = { id: 'system', type: 'system' };
    expect(actor.type).toBe('system');
  });
});

describe('Subject', () => {
  it('should have id and type fields', () => {
    const subject: Subject = { id: 'note-42', type: 'note' };
    expect(subject.id).toBe('note-42');
    expect(subject.type).toBe('note');
  });
});

describe('DomainEvent', () => {
  it('should have all required fields', () => {
    const event: DomainEvent = {
      id: 'evt-1',
      type: 'note.created',
      occurredAt: new Date('2026-01-01T00:00:00Z'),
      actor: { id: 'user-1', type: 'user' },
      subject: { id: 'note-1', type: 'note' },
      payload: { title: 'My Note' },
    };

    expect(event.id).toBe('evt-1');
    expect(event.type).toBe('note.created');
    expect(event.occurredAt).toBeInstanceOf(Date);
    expect(event.actor.id).toBe('user-1');
    expect(event.subject.id).toBe('note-1');
    expect(event.payload).toEqual({ title: 'My Note' });
  });
});

describe('createEvent', () => {
  it('should create event with auto-generated id', () => {
    const event = createEvent({
      type: 'note.created',
      actor: { id: 'user-1', type: 'user' },
      subject: { id: 'note-1', type: 'note' },
      payload: { title: 'Test' },
    });

    expect(event.id).toBeDefined();
    expect(typeof event.id).toBe('string');
    expect(event.id.length).toBeGreaterThan(0);
  });

  it('should create event with auto-generated occurredAt', () => {
    const before = new Date();
    const event = createEvent({
      type: 'note.updated',
      actor: { id: 'user-1', type: 'user' },
      subject: { id: 'note-1', type: 'note' },
      payload: {},
    });
    const after = new Date();

    expect(event.occurredAt).toBeInstanceOf(Date);
    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should preserve all provided fields', () => {
    const event = createEvent({
      type: 'note.deleted',
      actor: { id: 'admin-1', type: 'system' },
      subject: { id: 'note-99', type: 'note' },
      payload: { reason: 'cleanup' },
    });

    expect(event.type).toBe('note.deleted');
    expect(event.actor).toEqual({ id: 'admin-1', type: 'system' });
    expect(event.subject).toEqual({ id: 'note-99', type: 'note' });
    expect(event.payload).toEqual({ reason: 'cleanup' });
  });

  it('should generate unique ids for different events', () => {
    const event1 = createEvent({
      type: 'note.created',
      actor: { id: 'user-1', type: 'user' },
      subject: { id: 'note-1', type: 'note' },
      payload: {},
    });
    const event2 = createEvent({
      type: 'note.created',
      actor: { id: 'user-1', type: 'user' },
      subject: { id: 'note-2', type: 'note' },
      payload: {},
    });

    expect(event1.id).not.toBe(event2.id);
  });
});

describe('DomainEvents bus', () => {
  beforeEach(() => {
    DomainEvents.clear();
  });

  describe('publish', () => {
    it('should notify subscribers of matching event type', () => {
      const received: DomainEvent[] = [];
      DomainEvents.subscribe('note.created', (event) => {
        received.push(event);
      });

      const event = createEvent({
        type: 'note.created',
        actor: { id: 'user-1', type: 'user' },
        subject: { id: 'note-1', type: 'note' },
        payload: { title: 'Hello' },
      });

      DomainEvents.publish(event);

      expect(received).toHaveLength(1);
      expect(received[0]).toBe(event);
    });

    it('should not notify subscribers of different event types', () => {
      const received: DomainEvent[] = [];
      DomainEvents.subscribe('note.deleted', (event) => {
        received.push(event);
      });

      const event = createEvent({
        type: 'note.created',
        actor: { id: 'user-1', type: 'user' },
        subject: { id: 'note-1', type: 'note' },
        payload: {},
      });

      DomainEvents.publish(event);

      expect(received).toHaveLength(0);
    });

    it('should notify multiple subscribers of the same event type', () => {
      const received1: DomainEvent[] = [];
      const received2: DomainEvent[] = [];

      DomainEvents.subscribe('note.created', (event) => {
        received1.push(event);
      });
      DomainEvents.subscribe('note.created', (event) => {
        received2.push(event);
      });

      const event = createEvent({
        type: 'note.created',
        actor: { id: 'user-1', type: 'user' },
        subject: { id: 'note-1', type: 'note' },
        payload: {},
      });

      DomainEvents.publish(event);

      expect(received1).toHaveLength(1);
      expect(received2).toHaveLength(1);
    });
  });

  describe('subscribe', () => {
    it('should return an unsubscribe function', () => {
      const received: DomainEvent[] = [];
      const unsubscribe = DomainEvents.subscribe('note.created', (event) => {
        received.push(event);
      });

      expect(typeof unsubscribe).toBe('function');
    });

    it('should stop receiving events after unsubscribe', () => {
      const received: DomainEvent[] = [];
      const unsubscribe = DomainEvents.subscribe('note.created', (event) => {
        received.push(event);
      });

      const event1 = createEvent({
        type: 'note.created',
        actor: { id: 'user-1', type: 'user' },
        subject: { id: 'note-1', type: 'note' },
        payload: {},
      });

      DomainEvents.publish(event1);
      expect(received).toHaveLength(1);

      unsubscribe();

      const event2 = createEvent({
        type: 'note.created',
        actor: { id: 'user-1', type: 'user' },
        subject: { id: 'note-2', type: 'note' },
        payload: {},
      });

      DomainEvents.publish(event2);
      expect(received).toHaveLength(1);
    });
  });

  describe('clear', () => {
    it('should remove all subscribers', () => {
      const received: DomainEvent[] = [];
      DomainEvents.subscribe('note.created', (event) => {
        received.push(event);
      });
      DomainEvents.subscribe('note.deleted', (event) => {
        received.push(event);
      });

      DomainEvents.clear();

      DomainEvents.publish(
        createEvent({
          type: 'note.created',
          actor: { id: 'user-1', type: 'user' },
          subject: { id: 'note-1', type: 'note' },
          payload: {},
        }),
      );

      DomainEvents.publish(
        createEvent({
          type: 'note.deleted',
          actor: { id: 'user-1', type: 'user' },
          subject: { id: 'note-1', type: 'note' },
          payload: {},
        }),
      );

      expect(received).toHaveLength(0);
    });
  });

  describe('wildcard subscribe', () => {
    it('should receive all events when subscribing to "*"', () => {
      const received: DomainEvent[] = [];
      DomainEvents.subscribe('*', (event) => {
        received.push(event);
      });

      DomainEvents.publish(
        createEvent({
          type: 'note.created',
          actor: { id: 'user-1', type: 'user' },
          subject: { id: 'note-1', type: 'note' },
          payload: {},
        }),
      );

      DomainEvents.publish(
        createEvent({
          type: 'note.deleted',
          actor: { id: 'user-1', type: 'user' },
          subject: { id: 'note-2', type: 'note' },
          payload: {},
        }),
      );

      expect(received).toHaveLength(2);
    });
  });
});
