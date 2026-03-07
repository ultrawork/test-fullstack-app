'use client';

import { type ReactNode, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NoteView } from '@/components/notes/NoteView';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useNotesStore } from '@/stores/notes-store';

export default function NoteDetailPage(): ReactNode {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { selectedNote, isLoading, error, fetchNote } = useNotesStore();

  useEffect(() => {
    if (params.id) {
      fetchNote(params.id);
    }
  }, [params.id, fetchNote]);

  if (error) {
    return (
      <EmptyState
        title="Failed to load note"
        description={error}
        actionLabel="Back"
        onAction={() => router.back()}
      />
    );
  }

  if (isLoading || !selectedNote) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return <NoteView note={selectedNote} />;
}
