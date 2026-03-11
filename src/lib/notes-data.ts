import { Note } from "@/types/note";
import { sortNotes } from "./notes-utils";

const notes: Note[] = [];

export function getAllNotes(): Note[] {
  return sortNotes(notes);
}

export function getNoteById(id: string): Note | undefined {
  return notes.find((note) => note.id === id);
}

export function createNote(title: string, content: string): Note {
  const now = new Date().toISOString();
  const note: Note = {
    id: crypto.randomUUID(),
    title,
    content,
    isPinned: false,
    createdAt: now,
    updatedAt: now,
  };
  notes.push(note);
  return note;
}

export function updateNote(
  id: string,
  data: { title?: string; content?: string },
): Note | undefined {
  const note = notes.find((n) => n.id === id);
  if (!note) return undefined;
  if (data.title !== undefined) note.title = data.title;
  if (data.content !== undefined) note.content = data.content;
  note.updatedAt = new Date().toISOString();
  return { ...note };
}

export function toggleNotePin(id: string): Note | undefined {
  const note = notes.find((n) => n.id === id);
  if (!note) return undefined;
  note.isPinned = !note.isPinned;
  note.updatedAt = new Date().toISOString();
  return { ...note };
}

export function deleteNote(id: string): boolean {
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) return false;
  notes.splice(index, 1);
  return true;
}
