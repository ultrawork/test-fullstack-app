'use client';

import { type ReactNode, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { NoteView } from '@/components/notes/NoteView';
import { Spinner } from '@/components/ui/Spinner';
import { useNotesStore } from '@/stores/notes-store';

export default function NoteDetailPage(): ReactNode {
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

  return <NoteView note={selectedNote} />;
}
