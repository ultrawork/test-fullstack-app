/** Keys required for Web Push subscription encryption. */
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

/** DTO for removing a push subscription. */
export interface UnsubscribeDTO {
  endpoint: string;
}

/** Structured API error object. */
export interface ApiError {
  code: string;
  message: string;
  details?: string[];
}

/** Successful API response. */
export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
}

/** Error API response. */
export interface ApiErrorResponse {
  ok: false;
  error: ApiError;
}

/** Union type for all API responses. */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
