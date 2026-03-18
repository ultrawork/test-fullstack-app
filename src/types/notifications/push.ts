/** Keys required for push subscription encryption. */
export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

/** DTO for creating a push subscription. */
export interface PushSubscriptionDTO {
  endpoint: string;
  keys: PushSubscriptionKeys;
  expirationTime?: number | null;
  userId?: string;
}

/** Standardised API error shape. */
export interface ApiError {
  code: string;
  message: string;
  details?: string[];
}

/** Unified API response wrapper. */
export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };
