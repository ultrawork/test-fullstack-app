import { NextRequest, NextResponse } from "next/server";
import { toggleNotePin } from "@/lib/notes-data";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  _request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { id } = await params;
  const note = toggleNotePin(id);

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json(note);
}
