/** Error thrown when the browser does not support Push API. */
export class PushNotSupportedError extends Error {
  constructor(message = 'Push notifications are not supported in this browser') {
    super(message);
    this.name = 'PushNotSupportedError';
  }
}

/** Error thrown when the user denies push notification permission. */
export class PermissionDeniedError extends Error {
  constructor(message = 'Push notification permission was denied') {
    super(message);
    this.name = 'PermissionDeniedError';
  }
}

/** Error thrown when the service worker registration is not ready. */
export class ServiceWorkerNotReadyError extends Error {
  constructor(message = 'Service worker is not ready') {
    super(message);
    this.name = 'ServiceWorkerNotReadyError';
  }
}

/** Error thrown when a server API call fails. */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly responseBody: unknown;

  constructor(message: string, statusCode: number, responseBody?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}
