'use client';

import { type ReactNode, useEffect } from 'react';
import { NotesList } from '@/components/notes/NotesList';
import { SearchBar } from '@/components/notes/SearchBar';
import { useNotesStore } from '@/stores/notes-store';

export default function DashboardPage(): ReactNode {
  const { fetchNotes, filter, page } = useNotesStore();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes, filter, page]);

  return (
    <div data-testid="dashboard-page">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
      </header>
      <div className="mb-6">
        <SearchBar />
      </div>
      <NotesList />
    </div>
  );
}
