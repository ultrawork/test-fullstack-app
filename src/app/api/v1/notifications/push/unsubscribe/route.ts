import { ok, badRequest } from "@/lib/api/responses";
import { safeJson } from "@/lib/api/responses";
import { validateUnsubscribe } from "@/lib/validation/push";
import { getPushService } from "@/lib/services/push/PushService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/v1/notifications/push/unsubscribe — remove a push subscription. */
export async function POST(request: Request): Promise<Response> {
  const body = await safeJson(request);

  if (body === null) {
    return badRequest("INVALID_JSON", "Request body must be valid JSON");
  }

  const errors = validateUnsubscribe(body);
  if (errors.length > 0) {
    return badRequest("VALIDATION_ERROR", "Invalid unsubscribe data", errors);
  }

  const data = body as { endpoint: string };
  const pushService = getPushService();
  const result = await pushService.unsubscribe(data.endpoint);

  return ok(result);
}
