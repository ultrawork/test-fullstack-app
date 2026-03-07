'use client';

import { type ReactNode, useState } from 'react';
import { NoteCard } from './NoteCard';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useNotesStore } from '@/stores/notes-store';
import { useRouter } from 'next/navigation';

export function NotesList(): ReactNode {
  const router = useRouter();
  const { notes, isLoading, error, total, page, filter, setPage, deleteNote } = useNotesStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const noteToDelete = notes.find((n) => n.id === deleteId);
  const limit = filter.limit || 20;
  const totalPages = Math.ceil(total / limit);

  const handleDelete = async (): Promise<void> => {
    if (deleteId) {
      await deleteNote(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Failed to load notes"
        description={error}
        actionLabel="Retry"
        onAction={() => useNotesStore.getState().fetchNotes()}
      />
    );
  }

  if (notes.length === 0) {
    return (
      <EmptyState
        title="No notes yet"
        description="Create your first note to get started."
        actionLabel="New Note"
        onAction={() => router.push('/dashboard/notes/new')}
      />
    );
  }

  return (
    <section data-testid="notes-list">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onDelete={setDeleteId} />
        ))}
      </div>
      {totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Pagination">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </nav>
      )}
      <DeleteConfirmModal
        isOpen={!!deleteId}
        noteTitle={noteToDelete?.title || ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </section>
  );
}
