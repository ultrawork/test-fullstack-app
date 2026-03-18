import type { PushSubscriptionDTO } from "@/types/notifications/push";

/** Result of a subscribe operation. */
export interface SubscribeResult {
  created: boolean;
}

/** Result of an unsubscribe operation. */
export interface UnsubscribeResult {
  removed: boolean;
}

/** Contract for push-notification subscription management. */
export interface IPushService {
  /** Register a push subscription. */
  subscribe(dto: PushSubscriptionDTO): Promise<SubscribeResult>;
  /** Remove a push subscription by its endpoint URL. */
  unsubscribe(endpoint: string): Promise<UnsubscribeResult>;
}

/**
 * Push service implementation driven by environment variables.
 *
 * - When `NOTIFICATIONS_API_URL` is set, proxies subscribe/unsubscribe
 *   requests to the external notifications backend.
 * - When the variable is absent, operates as a no-op: logs a warning
 *   and returns a successful result.
 */
export class EnvPushService implements IPushService {
  private readonly apiUrl: string | undefined;

  constructor() {
    this.apiUrl = process.env.NOTIFICATIONS_API_URL;
  }

  /** Register a push subscription. */
  async subscribe(dto: PushSubscriptionDTO): Promise<SubscribeResult> {
    if (!this.apiUrl) {
      console.warn(
        "NOTIFICATIONS_API_URL is not configured — subscribe is a no-op"
      );
      return { created: true };
    }

    const response = await fetch(`${this.apiUrl}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new Error(
        `Notifications backend responded with ${response.status}`
      );
    }

    return (await response.json()) as SubscribeResult;
  }

  /** Remove a push subscription by its endpoint URL. */
  async unsubscribe(endpoint: string): Promise<UnsubscribeResult> {
    if (!this.apiUrl) {
      console.warn(
        "NOTIFICATIONS_API_URL is not configured — unsubscribe is a no-op"
      );
      return { removed: true };
    }

    const response = await fetch(`${this.apiUrl}/unsubscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint }),
    });

    if (!response.ok) {
      throw new Error(
        `Notifications backend responded with ${response.status}`
      );
    }

    return (await response.json()) as UnsubscribeResult;
  }
}

/** Singleton instance. */
let pushServiceInstance: IPushService | null = null;

/** Returns a singleton instance of `EnvPushService`. */
export function getPushService(): IPushService {
  if (!pushServiceInstance) {
    pushServiceInstance = new EnvPushService();
  }
  return pushServiceInstance;
}
