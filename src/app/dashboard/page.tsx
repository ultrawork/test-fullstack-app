"use client";

import { useEffect, useCallback } from "react";
import { useNotesStore } from "@/stores/notes-store";
import NotesList from "@/components/notes/NotesList";
import SearchBar from "@/components/notes/SearchBar";

export default function DashboardPage(): React.ReactNode {
  const { notes, isLoading, fetchNotes, setFilter } = useNotesStore();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSearch = useCallback(
    (query: string) => {
      setFilter({ search: query || undefined, page: 1 });
      fetchNotes();
    },
    [setFilter, fetchNotes],
  );

  return (
    <section>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
      </header>
      <div className="mb-6">
        <SearchBar onSearch={handleSearch} />
      </div>
      <NotesList notes={notes} isLoading={isLoading} />
    </section>
  );
}
