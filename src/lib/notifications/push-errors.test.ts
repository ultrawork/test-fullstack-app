import { describe, it, expect } from 'vitest';
import {
  PushNotSupportedError,
  PermissionDeniedError,
  ServiceWorkerNotReadyError,
  ApiError,
} from './push-errors';

describe('PushNotSupportedError', () => {
  it('should be an instance of Error', () => {
    const error = new PushNotSupportedError();
    expect(error).toBeInstanceOf(Error);
  });

  it('should have name "PushNotSupportedError"', () => {
    const error = new PushNotSupportedError();
    expect(error.name).toBe('PushNotSupportedError');
  });

  it('should have a default message', () => {
    const error = new PushNotSupportedError();
    expect(error.message).toBe('Push notifications are not supported in this browser');
  });

  it('should accept a custom message', () => {
    const error = new PushNotSupportedError('custom msg');
    expect(error.message).toBe('custom msg');
  });
});

describe('PermissionDeniedError', () => {
  it('should be an instance of Error', () => {
    const error = new PermissionDeniedError();
    expect(error).toBeInstanceOf(Error);
  });

  it('should have name "PermissionDeniedError"', () => {
    const error = new PermissionDeniedError();
    expect(error.name).toBe('PermissionDeniedError');
  });

  it('should have a default message', () => {
    const error = new PermissionDeniedError();
    expect(error.message).toBe('Push notification permission was denied');
  });

  it('should accept a custom message', () => {
    const error = new PermissionDeniedError('denied');
    expect(error.message).toBe('denied');
  });
});

describe('ServiceWorkerNotReadyError', () => {
  it('should be an instance of Error', () => {
    const error = new ServiceWorkerNotReadyError();
    expect(error).toBeInstanceOf(Error);
  });

  it('should have name "ServiceWorkerNotReadyError"', () => {
    const error = new ServiceWorkerNotReadyError();
    expect(error.name).toBe('ServiceWorkerNotReadyError');
  });

  it('should have a default message', () => {
    const error = new ServiceWorkerNotReadyError();
    expect(error.message).toBe('Service worker is not ready');
  });

  it('should accept a custom message', () => {
    const error = new ServiceWorkerNotReadyError('not ready');
    expect(error.message).toBe('not ready');
  });
});

describe('ApiError', () => {
  it('should be an instance of Error', () => {
    const error = new ApiError('Server error', 500);
    expect(error).toBeInstanceOf(Error);
  });

  it('should have name "ApiError"', () => {
    const error = new ApiError('Server error', 500);
    expect(error.name).toBe('ApiError');
  });

  it('should store the message', () => {
    const error = new ApiError('Server error', 500);
    expect(error.message).toBe('Server error');
  });

  it('should store the status code', () => {
    const error = new ApiError('Not found', 404);
    expect(error.statusCode).toBe(404);
  });

  it('should store optional response body', () => {
    const body = { detail: 'not found' };
    const error = new ApiError('Not found', 404, body);
    expect(error.responseBody).toEqual(body);
  });

  it('should have undefined responseBody when not provided', () => {
    const error = new ApiError('Error', 500);
    expect(error.responseBody).toBeUndefined();
  });
});
