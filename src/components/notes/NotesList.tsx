"use client";

import { useEffect } from "react";
import { useNotesStore } from "@/stores/notes-store";
import { NoteCard } from "./NoteCard";

export function NotesList(): React.ReactElement {
  const { notes, isLoading, error, fetchNotes, togglePin, deleteNote } =
    useNotesStore();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  if (isLoading) {
    return (
      <p className="text-center text-gray-500" role="status">
        Loading notes...
      </p>
    );
  }

  if (!error && notes.length === 0) {
    return (
      <p className="text-center text-gray-500" data-testid="empty-notes-message">
        No notes yet. Create your first note!
      </p>
    );
  }

  return (
    <section aria-label="Notes list" data-testid="notes-list">
      {error && (
        <p className="mb-4 text-center text-red-500" role="alert">
          Error: {error}
        </p>
      )}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <li key={note.id}>
            <NoteCard
              note={note}
              onTogglePin={togglePin}
              onDelete={deleteNote}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
