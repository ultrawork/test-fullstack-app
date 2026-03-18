import { NextResponse } from "next/server";
import { notificationService } from "@/lib/notifications/NotificationService";
import {
  NotificationsFilterSchema,
  CreateNotificationSchema,
} from "@/types/notifications";

/**
 * GET /api/v1/notifications
 * Returns paginated notifications for the authenticated user.
 * Query params: page, limit, type, priority.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: x-user-id header is required" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawFilter: Record<string, string> = {};
  for (const key of ["page", "limit", "type", "priority"]) {
    const value = searchParams.get(key);
    if (value) {
      rawFilter[key] = value;
    }
  }

  const parsed = NotificationsFilterSchema.safeParse(rawFilter);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues },
      { status: 400 }
    );
  }

  const result = await notificationService.getHistory(userId, parsed.data);
  return NextResponse.json({ success: true, data: result });
}

/**
 * POST /api/v1/notifications
 * Creates a new notification for the authenticated user.
 * Body: { type, title, body, priority? }
 */
export async function POST(request: Request): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: x-user-id header is required" },
      { status: 401 }
    );
  }

  const body: unknown = await request.json();
  const parsed = CreateNotificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues },
      { status: 400 }
    );
  }

  const notification = await notificationService.create({
    userId,
    ...parsed.data,
  });
  return NextResponse.json({ success: true, data: notification }, { status: 201 });
}
