'use client';

import { type ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useNotesStore } from '@/stores/notes-store';
import type { Note } from '@/types/note';

interface NoteViewProps {
  note: Note;
}

export function NoteView({ note }: NoteViewProps): ReactNode {
  const router = useRouter();
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = async (): Promise<void> => {
    await deleteNote(note.id);
    router.push('/dashboard');
  };

  return (
    <article data-testid="note-view" className="mx-auto max-w-2xl">
      <header className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          {note.category && <Badge name={note.category.name} color={note.category.color} />}
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{note.title}</h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
          <time dateTime={note.createdAt}>
            Created: {new Date(note.createdAt).toLocaleDateString()}
          </time>
          <time dateTime={note.updatedAt}>
            Updated: {new Date(note.updatedAt).toLocaleDateString()}
          </time>
        </div>
      </header>
      <section className="prose max-w-none">
        <p className="whitespace-pre-wrap text-gray-700">{note.content}</p>
      </section>
      <footer className="mt-8 flex gap-3">
        <Link href={`/dashboard/notes/${note.id}/edit`}>
          <Button>Edit</Button>
        </Link>
        <Button variant="danger" onClick={() => setShowDelete(true)}>
          Delete
        </Button>
        <Button variant="secondary" onClick={() => router.back()}>
          Back
        </Button>
      </footer>
      <DeleteConfirmModal
        isOpen={showDelete}
        noteTitle={note.title}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </article>
  );
}
