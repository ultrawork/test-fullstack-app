"use client";

import { useEffect } from "react";
import { useNotesStore } from "@/stores/notes-store";
import { NoteCard } from "./NoteCard";

export function NotesList(): React.JSX.Element {
  const { notes, isLoading, error, searchQuery, fetchNotes } = useNotesStore();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  if (isLoading) {
    return (
      <div
        data-testid="notes-list"
        aria-live="polite"
        className="py-12 text-center"
      >
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        data-testid="notes-list"
        aria-live="polite"
        className="py-12 text-center"
      >
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (notes.length === 0 && searchQuery) {
    return (
      <div
        data-testid="notes-list"
        aria-live="polite"
        className="py-12 text-center"
      >
        <p className="text-gray-500">Ничего не найдено</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div
        data-testid="notes-list"
        aria-live="polite"
        className="py-12 text-center"
      >
        <p className="text-gray-500">Нет заметок</p>
      </div>
    );
  }

  return (
    <div
      data-testid="notes-list"
      aria-live="polite"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
