import { NextResponse } from "next/server";
import { notificationService } from "@/lib/notifications/NotificationService";

/**
 * GET /api/v1/notifications/unread-count
 * Returns the count of unread notifications for the authenticated user.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: x-user-id header is required" },
      { status: 401 }
    );
  }

  const count = await notificationService.getUnreadCount(userId);
  return NextResponse.json({ success: true, data: { count } });
}
