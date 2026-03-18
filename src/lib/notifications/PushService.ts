import type { PushServiceConfig, SendPayload, SendOptions, SendResult } from "./types";
import {
  PushNotSupportedError,
  PermissionDeniedError,
  ServiceWorkerNotReadyError,
  ApiError,
} from "./errors";

const DEFAULT_CONFIG: PushServiceConfig = {
  baseUrl: "/api",
  serviceWorkerPath: "/sw.js",
  fetch: globalThis.fetch?.bind(globalThis),
};

/** Client-side service for managing push notification subscriptions and sending. */
export class PushService {
  private readonly config: PushServiceConfig;

  constructor(config: Partial<PushServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ──────────────────────── Private helpers ────────────────────────

  /** Performs a JSON API request and returns the parsed body. Throws ApiError on non-ok responses. */
  private async fetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    const response = await this.config.fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

    const body: unknown = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, body);
    }

    return body as T;
  }

  /** Throws PushNotSupportedError when not running in a browser with Notification API. */
  private ensureBrowserEnvironment(): void {
    if (typeof window === "undefined" || typeof Notification === "undefined") {
      throw new PushNotSupportedError();
    }
  }

  /** Ensures notification permission is granted. Requests it if current state is "default". */
  private async ensureNotificationsPermission(): Promise<void> {
    if (Notification.permission === "denied") {
      throw new PermissionDeniedError();
    }

    if (Notification.permission === "default") {
      const result = await Notification.requestPermission();
      if (result !== "granted") {
        throw new PermissionDeniedError();
      }
    }
  }

  // ──────────────────────── Public methods ────────────────────────

  /** Fetches the VAPID public key from the server. */
  async getVapidPublicKey(): Promise<string> {
    const data = await this.fetchJson<{ publicKey: string }>(
      "/push/vapid-public-key",
      { method: "GET" }
    );
    return data.publicKey;
  }

  /**
   * Subscribes the current browser to push notifications.
   * Idempotent — reuses existing subscription if one already exists.
   */
  async subscribe(): Promise<SendResult> {
    this.ensureBrowserEnvironment();
    await this.ensureNotificationsPermission();

    if (!navigator.serviceWorker) {
      throw new ServiceWorkerNotReadyError();
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const vapidPublicKey = await this.getVapidPublicKey();
      const applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey);

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });
    }

    const subJson = subscription.toJSON();

    return this.fetchJson<SendResult>("/push/subscribe", {
      method: "POST",
      body: JSON.stringify({
        endpoint: subJson.endpoint,
        keys: subJson.keys,
      }),
    });
  }

  /** Unsubscribes the current browser from push notifications. No-op if not subscribed. */
  async unsubscribe(): Promise<void> {
    this.ensureBrowserEnvironment();

    if (!navigator.serviceWorker) {
      throw new ServiceWorkerNotReadyError();
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return;
    }

    await subscription.unsubscribe();

    await this.fetchJson("/push/unsubscribe", {
      method: "POST",
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
  }

  /** Sends a push notification to a specific user via the server. */
  async sendToUser(
    userId: string,
    payload: SendPayload,
    options: SendOptions = {}
  ): Promise<SendResult> {
    return this.fetchJson<SendResult>(`/push/send/${userId}`, {
      method: "POST",
      body: JSON.stringify({ payload, options }),
    });
  }

  // ──────────────────────── Utilities ────────────────────────

  /** Converts a URL-safe base64 string to a Uint8Array (for applicationServerKey). */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

/** Default singleton instance of PushService. */
export const pushService = new PushService();
