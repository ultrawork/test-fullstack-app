"use client";

import { useState } from "react";
import NotesList from "@/components/NotesList";
import SearchInput from "@/components/SearchInput";
import type { Note } from "@/types/note";

const notes: Note[] = [
  {
    id: "1",
    title: "First Note",
    content: "A short introduction note for the notes app.",
  },
  {
    id: "2",
    title: "Shopping list",
    content: "Milk, eggs, bread, and fruit for the week.",
  },
  {
    id: "3",
    title: "Work plan",
    content: "Prepare roadmap updates and review sprint tasks.",
  },
];

export default function HomePage(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredNotes = normalizedQuery
    ? notes.filter((note) => note.title.toLowerCase().includes(normalizedQuery))
    : notes;

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold">Notes App</h1>
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
        </header>
        <NotesList notes={filteredNotes} />
      </div>
    </main>
  );
}
