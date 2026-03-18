import { NextResponse } from "next/server";
import { notificationService } from "@/lib/notifications/NotificationService";

/**
 * PATCH /api/v1/notifications/[id]/read
 * Marks a single notification as read.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: x-user-id header is required" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const notification = await notificationService.markRead(id, userId);

  if (!notification) {
    return NextResponse.json(
      { success: false, error: "Notification not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: notification });
}
