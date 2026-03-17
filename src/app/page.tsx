"use client";

import { useMemo, useState } from "react";
import NotesList from "@/components/NotesList";
import SearchInput from "@/components/SearchInput";
import type { Note } from "@/types/note";

const notes: Note[] = [
  {
    id: "1",
    title: "First Note",
    content: "Capture quick thoughts and reminders in your first note.",
  },
  {
    id: "2",
    title: "Shopping list",
    content: "Remember milk, bread, fruit, and tea for the week.",
  },
  {
    id: "3",
    title: "Work plan",
    content: "Outline priorities, milestones, and follow-up tasks for work.",
  },
];

/**
 * Renders the main notes page with a client-side title search filter.
 */
export default function HomePage(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredNotes = useMemo((): Note[] => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return notes;
    }

    return notes.filter((note) =>
      note.title.toLowerCase().includes(normalizedQuery),
    );
  }, [searchQuery]);

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900">Notes App</h1>
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>
      </header>
      <main className="mx-auto flex min-h-screen w-full max-w-4xl px-6 py-8">
        <NotesList notes={filteredNotes} />
      </main>
    </>
  );
}
