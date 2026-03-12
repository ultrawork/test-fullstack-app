"use client";

import NoteView from "@/components/notes/NoteView";
import type { Note } from "@/types/note";

/**
 * Тестовая страница для E2E тестов — простая заметка без категории и тегов.
 * Используется только в тестовом окружении.
 */
const testNote: Note = {
  id: "test-1",
  title: "My Note",
  content: "Note body text",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-16T12:00:00Z",
};

export default function TestNoteSimplePage() {
  return (
    <main className="p-8">
      <NoteView note={testNote} />
    </main>
  );
}
