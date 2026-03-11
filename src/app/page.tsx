"use client";

import { SearchBar } from "@/components/notes/SearchBar";
import { NotesList } from "@/components/notes/NotesList";

export default function HomePage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="border-b border-gray-200 bg-white px-4 py-6 shadow-sm">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Notes App</h1>
          <SearchBar />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <NotesList />
      </main>
    </div>
  );
}
