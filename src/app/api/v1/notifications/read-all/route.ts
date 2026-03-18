import { NextResponse } from "next/server";
import { notificationService } from "@/lib/notifications/NotificationService";

/**
 * PATCH /api/v1/notifications/read-all
 * Marks all unread notifications as read for the authenticated user.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: x-user-id header is required" },
      { status: 401 }
    );
  }

  const result = await notificationService.markAllRead(userId);
  return NextResponse.json({ success: true, data: result });
}
