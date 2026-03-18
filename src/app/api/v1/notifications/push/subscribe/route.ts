import { ok, badRequest } from "@/lib/api/responses";
import { safeJson } from "@/lib/api/responses";
import { validatePushSubscription } from "@/lib/validation/push";
import { getPushService } from "@/lib/services/push/PushService";
import type { PushSubscriptionDTO } from "@/types/notifications/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/v1/notifications/push/subscribe — register a push subscription. */
export async function POST(request: Request): Promise<Response> {
  const body = await safeJson(request);

  if (body === null) {
    return badRequest("INVALID_JSON", "Request body must be valid JSON");
  }

  const errors = validatePushSubscription(body);
  if (errors.length > 0) {
    return badRequest("VALIDATION_ERROR", "Invalid subscription data", errors);
  }

  const dto = body as PushSubscriptionDTO;
  const pushService = getPushService();
  const result = await pushService.subscribe(dto);

  return ok(result);
}
