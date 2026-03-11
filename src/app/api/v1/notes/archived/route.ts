import { NextResponse } from "next/server";
import type { ArchivedNote, ApiResponse } from "@/types/archive";
import { archiveMap } from "@/lib/archive-storage";

export function GET(): NextResponse<ApiResponse<ArchivedNote[]>> {
  const items = Array.from(archiveMap.values());
  return NextResponse.json({ success: true, data: items });
}
