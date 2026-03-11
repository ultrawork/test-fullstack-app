import { NextRequest, NextResponse } from "next/server";
import { getAllNotes, createNote } from "@/lib/notes-data";

export function GET(): NextResponse {
  const notes = getAllNotes();
  return NextResponse.json(notes);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, content } = body as { title?: string; content?: string };

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (content !== undefined && typeof content !== "string") {
    return NextResponse.json(
      { error: "Content must be a string" },
      { status: 400 },
    );
  }

  const note = createNote(title, content ?? "");
  return NextResponse.json(note, { status: 201 });
}
