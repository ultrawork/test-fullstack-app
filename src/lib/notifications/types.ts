/** Configuration for PushService. */
export interface PushServiceConfig {
  /** Base URL for the push notification API. */
  baseUrl: string;
  /** Path to the service worker file. */
  serviceWorkerPath: string;
  /** Custom fetch implementation for dependency injection. */
  fetch: typeof globalThis.fetch;
}

/** Payload for sending a push notification to a user. */
export interface SendPayload {
  /** Title of the notification. */
  title: string;
  /** Body text of the notification. */
  body: string;
  /** Optional icon URL. */
  icon?: string;
  /** Optional URL to navigate to on click. */
  url?: string;
}

/** Options for sending a push notification. */
export interface SendOptions {
  /** Whether the notification requires user interaction to dismiss. */
  requireInteraction?: boolean;
  /** Tag for notification grouping/replacement. */
  tag?: string;
}

/** Result returned after sending a push notification. */
export interface SendResult {
  /** Whether the send was successful. */
  success: boolean;
  /** Message from the server. */
  message?: string;
}
