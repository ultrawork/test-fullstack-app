/**
 * Push notification service — interface and HTTP implementation.
 *
 * Architectural decisions:
 * - DI: dependencies injected via constructor
 * - Injectable fetch: fetch function is injected for testability
 * - Only PUSH channel
 */

/** Payload for a push notification. */
export interface PushPayload {
  token: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/** Result of a single push send attempt. */
export interface PushResult {
  success: boolean;
  token: string;
  error?: string;
}

/** Fetch function signature (subset of global fetch). */
export type FetchFn = (
  url: string,
  init: RequestInit,
) => Promise<Response>;

/** Push service contract. */
export interface IPushService {
  /** Send a single push notification. */
  send(payload: PushPayload): Promise<PushResult>;
  /** Send multiple push notifications. */
  sendBatch(payloads: PushPayload[]): Promise<PushResult[]>;
}

/** HTTP-based push service implementation. */
export class HttpPushService implements IPushService {
  private readonly endpoint: string;
  private readonly fetchFn: FetchFn;

  constructor(endpoint: string, fetchFn: FetchFn) {
    this.endpoint = endpoint;
    this.fetchFn = fetchFn;
  }

  /** Send a single push notification via HTTP POST. */
  async send(payload: PushPayload): Promise<PushResult> {
    try {
      const response = await this.fetchFn(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message =
          (body as Record<string, string>).error ??
          `HTTP ${response.status}`;
        return { success: false, token: payload.token, error: message };
      }

      return { success: true, token: payload.token };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown push error";
      return { success: false, token: payload.token, error: message };
    }
  }

  /** Send multiple push notifications concurrently. */
  async sendBatch(payloads: PushPayload[]): Promise<PushResult[]> {
    return Promise.all(payloads.map((p) => this.send(p)));
  }
}
