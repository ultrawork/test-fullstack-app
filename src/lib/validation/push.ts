/** Check that value is a non-empty string. */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** Check that value looks like a base64url-encoded string. */
export function isBase64UrlString(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  return /^[A-Za-z0-9_-]+={0,2}$/.test(value);
}

/** Check that value is a valid URL string (http/https). */
function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/** Validate subscribe request body. Returns array of error strings (empty if valid). */
export function validatePushSubscription(body: unknown): string[] {
  const errors: string[] = [];

  if (body === null || typeof body !== "object") {
    errors.push("Request body must be an object");
    return errors;
  }

  const data = body as Record<string, unknown>;

  if (!isNonEmptyString(data.endpoint)) {
    errors.push("endpoint is required and must be a non-empty string");
  } else if (!isValidUrl(data.endpoint)) {
    errors.push("endpoint must be a valid URL");
  }

  if (data.keys === null || typeof data.keys !== "object") {
    errors.push("keys is required and must be an object with p256dh and auth");
  } else {
    const keys = data.keys as Record<string, unknown>;
    if (!isBase64UrlString(keys.p256dh)) {
      errors.push("keys.p256dh is required and must be a base64url string");
    }
    if (!isBase64UrlString(keys.auth)) {
      errors.push("keys.auth is required and must be a base64url string");
    }
  }

  return errors;
}

/** Validate unsubscribe request body. Returns array of error strings (empty if valid). */
export function validateUnsubscribe(body: unknown): string[] {
  const errors: string[] = [];

  if (body === null || typeof body !== "object") {
    errors.push("Request body must be an object");
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
