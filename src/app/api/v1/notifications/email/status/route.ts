import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

/** GET handler for email queue status — returns pending/sent/failed counts for the last 24 hours. Admin-only. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: token },
      select: { role: true },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: admin access required" },
        { status: 403 },
      );
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [pending, sent, failed] = await Promise.all([
      prisma.emailQueue.count({
        where: { status: "pending", createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.emailQueue.count({
        where: { status: "sent", createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.emailQueue.count({
        where: { status: "failed", createdAt: { gte: twentyFourHoursAgo } },
      }),
    ]);

    return NextResponse.json({ data: { pending, sent, failed } });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
