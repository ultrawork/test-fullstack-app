/**
 * Ручная валидация push-подписок без внешних зависимостей (AD-2).
 */

const BASE64URL_REGEX = /^[A-Za-z0-9_-]+$/;

/** Проверяет, что значение — непустая строка. */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** Проверяет, что значение — валидная base64url-строка. */
export function isBase64UrlString(value: unknown): value is string {
  return isNonEmptyString(value) && BASE64URL_REGEX.test(value);
}

/** Проверяет, что строка — валидный URL. */
function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Валидирует payload подписки на push-уведомления (REQ-3, REQ-6).
 * Возвращает массив строк с описанием ошибок (пустой при успехе).
 */
export function validatePushSubscription(body: unknown): string[] {
  const errors: string[] = [];

  if (!body || typeof body !== "object") {
    errors.push("Request body must be a non-null object");
    return errors;
  }

  const data = body as Record<string, unknown>;

  if (!isNonEmptyString(data.endpoint)) {
    errors.push("endpoint is required and must be a non-empty string");
  } else if (!isValidUrl(data.endpoint)) {
    errors.push("endpoint must be a valid URL");
  }

  if (!data.keys || typeof data.keys !== "object") {
    errors.push("keys object is required with p256dh and auth fields");
  } else {
    const keys = data.keys as Record<string, unknown>;

    if (!isBase64UrlString(keys.p256dh)) {
      errors.push("keys.p256dh is required and must be a valid base64url string");
    }

    if (!isBase64UrlString(keys.auth)) {
      errors.push("keys.auth is required and must be a valid base64url string");
    }
  }

  return errors;
}

/**
 * Валидирует payload отписки от push-уведомлений (REQ-4, REQ-6).
 * Возвращает массив строк с описанием ошибок (пустой при успехе).
 */
export function validateUnsubscribe(body: unknown): string[] {
  const errors: string[] = [];

  if (!body || typeof body !== "object") {
    errors.push("Request body must be a non-null object");
    return errors;
  }

  const data = body as Record<string, unknown>;

  if (!isNonEmptyString(data.endpoint)) {
    errors.push("endpoint is required and must be a non-empty string");
  } else if (!isValidUrl(data.endpoint)) {
    errors.push("endpoint must be a valid URL");
  }

  return errors;
}
