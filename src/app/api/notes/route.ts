import { NextRequest, NextResponse } from "next/server";
import { listNotes } from "@/app/api/_db/notes";
import type { Note } from "@/types/note";

/**
 * GET /api/notes
 *
 * Возвращает список заметок. Поддерживает фильтрацию по тегу
 * через query-параметр `tag` (includes-фильтрация по массиву tags).
 * Всегда возвращает 200.
 */
export function GET(request: NextRequest): NextResponse<Note[]> {
  const tag = request.nextUrl.searchParams.get("tag")?.trim() || null;

  let notes = listNotes();

  if (tag) {
    notes = notes.filter((note) => note.tags.includes(tag));
  }

  return NextResponse.json(notes, { status: 200 });
}
