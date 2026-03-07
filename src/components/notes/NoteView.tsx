"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import type { Note } from "@/types/note";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/notes/DeleteConfirmModal";

interface NoteViewProps {
  note: Note;
  onDelete: (id: string) => Promise<void>;
}

export default function NoteView({
  note,
  onDelete,
}: NoteViewProps): ReactNode {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{note.title}</h1>
          <div className="mt-2 flex items-center gap-3">
            {note.category && (
              <Badge label={note.category.name} color={note.category.color} />
            )}
            <time
              className="text-sm text-gray-500"
              dateTime={note.updatedAt}
            >
              Updated {new Date(note.updatedAt).toLocaleDateString()}
            </time>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/notes/${note.id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </header>
      <section className="prose max-w-none whitespace-pre-wrap text-gray-700">
        {note.content}
      </section>
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => onDelete(note.id)}
        noteTitle={note.title}
      />
    </article>
  );
}
