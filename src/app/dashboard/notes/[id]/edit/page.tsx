'use client';

import { type ReactNode, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useNotesStore } from '@/stores/notes-store';

export default function EditNotePage(): ReactNode {
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

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Note</h1>
      <NoteEditor note={selectedNote} />
    </div>
  );
}
