/** Error thrown when Push API is not supported by the browser. */
export class PushNotSupportedError extends Error {
  constructor(message = "Push notifications are not supported in this browser") {
    super(message);
    this.name = "PushNotSupportedError";
  }
}

/** Error thrown when the user denies notification permission. */
export class PermissionDeniedError extends Error {
  constructor(message = "Notification permission was denied") {
    super(message);
    this.name = "PermissionDeniedError";
  }
}

/** Error thrown when the service worker is not ready. */
export class ServiceWorkerNotReadyError extends Error {
  constructor(message = "Service worker is not ready") {
    super(message);
    this.name = "ServiceWorkerNotReadyError";
  }
}

/** Error thrown when an API request fails. */
export class ApiError extends Error {
  public readonly status: number;
  public readonly body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `API request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}
