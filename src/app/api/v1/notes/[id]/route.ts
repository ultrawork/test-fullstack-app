import { NextRequest, NextResponse } from "next/server";
import { getNoteById, updateNote, deleteNote } from "@/lib/notes-data";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { id } = await params;
  const note = getNoteById(id);
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }
  return NextResponse.json(note);
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = body.title !== undefined ? body.title : undefined;
  const content = body.content !== undefined ? body.content : undefined;

  if (title !== undefined && typeof title !== "string") {
    return NextResponse.json(
      { error: "Title must be a string" },
      { status: 400 },
    );
  }

  if (content !== undefined && typeof content !== "string") {
    return NextResponse.json(
      { error: "Content must be a string" },
      { status: 400 },
    );
  }

  const updated = updateNote(id, { title, content });
  if (!updated) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { id } = await params;
  const deleted = deleteNote(id);
  if (!deleted) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
