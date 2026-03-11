import { NextResponse } from "next/server";
import type { ArchivedNote, ApiResponse } from "@/types/archive";
import { archiveMap } from "@/lib/archive-storage";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<ArchivedNote>>> {
  const { id } = await params;

  const item = archiveMap.get(id);

  if (!item) {
    return NextResponse.json(
      { success: false, error: "Note not found in archive" },
      { status: 404 },
    );
  }

  archiveMap.delete(id);

  return NextResponse.json({ success: true, data: item });
}
