/** Check whether code is running in a browser environment. */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Convert a base64url-encoded string (e.g. VAPID public key) to a Uint8Array.
 *
 * Handles the base64url → base64 translation (`-` → `+`, `_` → `/`)
 * and adds any missing `=` padding before decoding.
 */
export function base64UrlToUint8Array(base64Url: string): Uint8Array {
  if (base64Url === '') {
    return new Uint8Array(0);
  }

  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/') + padding;

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
