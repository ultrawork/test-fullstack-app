"use client";

import NoteView from "@/components/notes/NoteView";
import type { Note } from "@/types/note";

/**
 * Тестовая страница для E2E тестов — заметка с категорией и тегами.
 * Используется только в тестовом окружении.
 */
const testNote: Note = {
  id: "test-2",
  title: "Work Note",
  content: "Task list",
  category: "Work",
  tags: ["important", "project"],
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-16T12:00:00Z",
};

export default function TestNoteWithMetaPage() {
  return (
    <main className="p-8">
      <NoteView note={testNote} />
    </main>
  );
}
