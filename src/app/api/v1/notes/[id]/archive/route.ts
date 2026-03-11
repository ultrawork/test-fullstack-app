import { NextResponse } from "next/server";
import type {
  ArchivedNote,
  ArchiveNoteInput,
  ApiResponse,
} from "@/types/archive";
import { archiveMap } from "@/lib/archive-storage";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<ArchivedNote>>> {
  const { id } = await params;

  let body: ArchiveNoteInput;

  try {
    body = (await request.json()) as ArchiveNoteInput;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json(
      {
        success: false,
        error: "Field 'title' is required and must be a string",
      },
      { status: 400 },
    );
  }

  if (!body.content || typeof body.content !== "string") {
    return NextResponse.json(
      {
        success: false,
        error: "Field 'content' is required and must be a string",
      },
      { status: 400 },
    );
  }

  if (archiveMap.has(id)) {
    return NextResponse.json(
      {
        success: false,
        error: "Note is already archived",
      },
      { status: 409 },
    );
  }

  const item: ArchivedNote = {
    id,
    title: body.title,
    content: body.content,
    archivedAt: new Date().toISOString(),
  };

  archiveMap.set(id, item);

  return NextResponse.json({ success: true, data: item }, { status: 201 });
}
