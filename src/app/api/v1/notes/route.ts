import { NextRequest, NextResponse } from "next/server";
import { searchNotes } from "@/lib/notes-storage";
import type { ApiResponse, NotesResponse } from "@/types/note";

const MAX_SEARCH_LENGTH = 200;

export function GET(
  request: NextRequest,
): NextResponse<ApiResponse<NotesResponse>> {
  const searchParam = request.nextUrl.searchParams.get("search") ?? "";
  const query = searchParam.trim().slice(0, MAX_SEARCH_LENGTH);

  const notes = searchNotes(query);

  return NextResponse.json({
    success: true,
    data: {
      notes,
      total: notes.length,
    },
  });
}
