import { describe, it, expectTypeOf } from 'vitest';
import type {
  PushServiceConfig,
  SendPayload,
  SendOptions,
  SendResult,
} from './push-types';

describe('PushServiceConfig', () => {
  it('should require vapidPublicKey and apiBaseUrl', () => {
    expectTypeOf<PushServiceConfig>().toHaveProperty('vapidPublicKey');
    expectTypeOf<PushServiceConfig>().toHaveProperty('apiBaseUrl');
  });
});

describe('SendPayload', () => {
  it('should require title and body', () => {
    expectTypeOf<SendPayload>().toHaveProperty('title');
    expectTypeOf<SendPayload>().toHaveProperty('body');
  });

  it('should allow optional icon and url', () => {
    expectTypeOf<SendPayload>().toHaveProperty('icon');
    expectTypeOf<SendPayload>().toHaveProperty('url');
  });
});

describe('SendOptions', () => {
  it('should allow optional userIds, topic, urgency', () => {
    expectTypeOf<SendOptions>().toHaveProperty('userIds');
    expectTypeOf<SendOptions>().toHaveProperty('topic');
    expectTypeOf<SendOptions>().toHaveProperty('urgency');
  });
});

describe('SendResult', () => {
  it('should require success, deliveredCount, failedCount', () => {
    expectTypeOf<SendResult>().toHaveProperty('success');
    expectTypeOf<SendResult>().toHaveProperty('deliveredCount');
    expectTypeOf<SendResult>().toHaveProperty('failedCount');
  });
});
