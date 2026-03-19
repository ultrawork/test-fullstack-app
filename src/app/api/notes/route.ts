import { NextResponse } from "next/server";
import { listNotes } from "@/app/api/_db/notes";
import type { Note } from "@/types/note";

/**
 * GET /api/notes
 *
 * Возвращает список заметок. Поддерживает фильтрацию по тегу
 * через query-параметр `tag` (includes-фильтрация по массиву tags).
 * Всегда возвращает 200.
 */
export function GET(request: Request): NextResponse<Note[]> {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag");

  let notes = listNotes();

  if (tag) {
    notes = notes.filter((note) => note.tags.includes(tag));
  }

  return NextResponse.json(notes, { status: 200 });
}
