/**
 * Possible permission states for push notifications.
 */
export type PushPermissionState =
  | "prompt"
  | "granted"
  | "denied"
  | "unsupported";

/**
 * Configuration for the usePushSubscription hook.
 */
export interface PushSubscriptionConfig {
  /** API endpoint for subscribing to push notifications. */
  subscribeUrl: string;
  /** API endpoint for unsubscribing from push notifications. */
  unsubscribeUrl: string;
  /** VAPID public key used for push subscription authentication. */
  vapidPublicKey: string;
  /** Whether to auto-subscribe when permission is granted. */
  autoSubscribe: boolean;
}

/**
 * Payload sent to the server when managing push subscriptions.
 */
export interface ServerPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * State portion of the usePushSubscription hook return value.
 */
export interface PushSubscriptionState {
  /** Whether the browser supports push notifications. */
  isSupported: boolean;
  /** Current push notification permission state. */
  permissionState: PushPermissionState;
  /** Whether the user is currently subscribed. */
  isSubscribed: boolean;
  /** Whether a subscribe/unsubscribe operation is in progress. */
  isLoading: boolean;
  /** Last error that occurred, or null. */
  error: Error | null;
}

/**
 * Actions available from the usePushSubscription hook.
 */
export interface PushSubscriptionActions {
  /** Subscribe to push notifications. */
  subscribe: () => Promise<void>;
  /** Unsubscribe from push notifications. */
  unsubscribe: () => Promise<void>;
}

/**
 * Full return type of the usePushSubscription hook.
 */
export type UsePushSubscriptionReturn = PushSubscriptionState &
  PushSubscriptionActions;

/**
 * Default configuration for the usePushSubscription hook.
 * Uses standard notification API paths from the platform specification.
 */
export const DEFAULT_CONFIG: PushSubscriptionConfig = {
  subscribeUrl: "/api/v1/notifications/subscribe",
  unsubscribeUrl: "/api/v1/notifications/subscribe",
  vapidPublicKey: "",
  autoSubscribe: false,
};

/**
 * Converts a URL-safe base64 string to a Uint8Array.
 * Used to convert VAPID public keys for PushManager.subscribe().
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Converts a browser PushSubscription to the server payload format.
 * Extracts endpoint and encryption keys (p256dh, auth).
 */
export function toServerPayload(subscription: PushSubscription): ServerPayload {
  const json = subscription.toJSON();

  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: json.keys?.p256dh ?? "",
      auth: json.keys?.auth ?? "",
    },
  };
}
