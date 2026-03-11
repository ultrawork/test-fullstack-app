import { NextRequest, NextResponse } from "next/server";
import { getAllNotes, createNote } from "@/lib/notes-data";

export function GET(): NextResponse {
  const notes = getAllNotes();
  return NextResponse.json(notes);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { title, content } = body;

  if (!title || typeof title !== "string") {
    return NextResponse.json(
      { error: "Title is required" },
      { status: 400 },
    );
  }

  const note = createNote(title, content ?? "");
  return NextResponse.json(note, { status: 201 });
}
