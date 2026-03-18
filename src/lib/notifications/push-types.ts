/** Configuration required to initialise the push notification service. */
export interface PushServiceConfig {
  /** VAPID public key (base64url-encoded). */
  vapidPublicKey: string;
  /** Base URL of the backend API that manages push subscriptions. */
  apiBaseUrl: string;
}

/** Payload sent in a push notification. */
export interface SendPayload {
  /** Notification title. */
  title: string;
  /** Notification body text. */
  body: string;
  /** Optional icon URL. */
  icon?: string;
  /** Optional URL to open on notification click. */
  url?: string;
}

/** Options for sending a push notification. */
export interface SendOptions {
  /** Target user IDs. When empty, sends to all subscribers. */
  userIds?: string[];
  /** Topic for notification grouping / collapsing. */
  topic?: string;
  /** Urgency hint for the push service. */
  urgency?: 'very-low' | 'low' | 'normal' | 'high';
}

/** Result returned after a push notification send request. */
export interface SendResult {
  /** Whether the send request was accepted by the server. */
  success: boolean;
  /** Number of subscriptions the message was delivered to. */
  deliveredCount: number;
  /** Number of subscriptions that failed. */
  failedCount: number;
}
