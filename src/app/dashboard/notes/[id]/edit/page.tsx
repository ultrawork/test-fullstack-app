"use client";

import { type ReactNode, useEffect, use } from "react";
import NoteEditor from "@/components/notes/NoteEditor";
import Spinner from "@/components/ui/Spinner";
import { useNotesStore } from "@/stores/notes-store";

interface EditNotePageProps {
  params: Promise<{ id: string }>;
}

export default function EditNotePage({ params }: EditNotePageProps): ReactNode {
  const { id } = use(params);
  const { currentNote, isLoadingNote, error, fetchNote } = useNotesStore();

  useEffect(() => {
    void fetchNote(id);
  }, [id, fetchNote]);

  if (isLoadingNote) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !currentNote) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-red-600" role="alert">
          {error ?? "Note not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Note</h1>
      <NoteEditor note={currentNote} />
    </div>
  );
}
