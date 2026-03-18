import { ok, internalError } from "@/lib/api/responses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/v1/notifications/push/vapid-key — returns the public VAPID key. */
export function GET(): Response {
  const vapidPublicKey =
    process.env.VAPID_PUBLIC_KEY ??
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!vapidPublicKey) {
    return internalError(
      "VAPID_KEY_NOT_CONFIGURED",
      "VAPID public key is not configured on the server"
    );
  }

  return ok({ vapidPublicKey });
}
