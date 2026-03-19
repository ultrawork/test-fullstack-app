import { NextResponse } from "next/server";
import { findNote, removeTagFromNote } from "@/app/api/_db/notes";

interface RouteContext {
  params: Promise<{ id: string; tag: string }>;
}

/**
 * DELETE /api/notes/[id]/tags/[tag] — удаляет тег из заметки.
 *
 * - Параметр tag декодируется через decodeURIComponent.
 * - Несуществующая заметка возвращает 404.
 * - Удаление несуществующего тега — идемпотентно, возвращает 200.
 */
export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { id, tag: rawTag } = await context.params;
  const tag = decodeURIComponent(rawTag);

  const note = findNote(id);
  if (!note) {
    return NextResponse.json(
      { error: `Note '${id}' not found` },
      { status: 404 },
    );
  }

  const updated = removeTagFromNote(id, tag);
  return NextResponse.json(updated, { status: 200 });
}
