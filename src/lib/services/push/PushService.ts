import type { PushSubscriptionDTO } from "@/types/notifications/push";

/** Interface for push subscription management. */
export interface IPushService {
  subscribe(dto: PushSubscriptionDTO): Promise<{ created: boolean }>;
  unsubscribe(endpoint: string): Promise<{ removed: boolean }>;
}

/** PushService implementation that delegates to an external backend or performs a no-op. */
export class EnvPushService implements IPushService {
  private readonly apiUrl: string | undefined;

  constructor() {
    this.apiUrl = process.env.NOTIFICATIONS_API_URL;
  }

  async subscribe(dto: PushSubscriptionDTO): Promise<{ created: boolean }> {
    if (!this.apiUrl) {
      console.warn(
        "[PushService] NOTIFICATIONS_API_URL is not set. Subscribe is a no-op."
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
        `Push subscribe proxy failed: ${response.status} ${response.statusText}`
      );
    }

    return { created: true };
  }

  async unsubscribe(endpoint: string): Promise<{ removed: boolean }> {
    if (!this.apiUrl) {
      console.warn(
        "[PushService] NOTIFICATIONS_API_URL is not set. Unsubscribe is a no-op."
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
        `Push unsubscribe proxy failed: ${response.status} ${response.statusText}`
      );
    }

    return { removed: true };
  }
}

let instance: IPushService | null = null;

/** Get singleton PushService instance. */
export function getPushService(): IPushService {
  if (!instance) {
    instance = new EnvPushService();
  }
  return instance;
}
