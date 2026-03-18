/**
 * Ключи подписки Push API (Web Push Protocol).
 */
export interface PushSubscriptionKeys {
  /** ECDH public key (P-256) в формате Base64url */
  p256dh: string;
  /** Authentication secret в формате Base64url */
  auth: string;
}

/**
 * DTO для создания/передачи push-подписки.
 * Соответствует структуре PushSubscription из Web Push API.
 */
export interface PushSubscriptionDTO {
  /** Push endpoint URL, предоставленный браузером */
  endpoint: string;
  /** Криптографические ключи подписки */
  keys: PushSubscriptionKeys;
  /** Время истечения подписки (Unix timestamp в мс), может быть null */
  expirationTime?: number | null;
  /** Идентификатор пользователя для привязки подписки */
  userId?: string;
}

/**
 * Структура ошибки в API-ответах.
 */
export interface ApiError {
  /** Машиночитаемый код ошибки */
  code: string;
  /** Человекочитаемое описание ошибки */
  message: string;
  /** Список детальных ошибок валидации */
  details?: string[];
}

/**
 * Успешный API-ответ с данными типа T.
 */
export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
}

/**
 * API-ответ с ошибкой.
 */
export interface ApiErrorResponse {
  ok: false;
  error: ApiError;
}

/**
 * Объединённый тип API-ответа.
 * Дискриминант `ok` позволяет сужать тип:
 *
 * ```ts
 * if (response.ok) {
 *   response.data; // T
 * } else {
 *   response.error; // ApiError
 * }
 * ```
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
