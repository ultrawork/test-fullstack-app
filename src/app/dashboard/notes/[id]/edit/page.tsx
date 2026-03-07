'use client';

import { type ReactNode, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { Spinner } from '@/components/ui/Spinner';
import { useNotesStore } from '@/stores/notes-store';

export default function EditNotePage(): ReactNode {
  const params = useParams<{ id: string }>();
  const { selectedNote, isLoading, fetchNote } = useNotesStore();

  useEffect(() => {
    if (params.id) {
      fetchNote(params.id);
    }
  }, [params.id, fetchNote]);

  if (isLoading || !selectedNote) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Note</h1>
      <NoteEditor note={selectedNote} />
    </div>
  );
}
