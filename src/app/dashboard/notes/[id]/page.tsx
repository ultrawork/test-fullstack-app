"use client";

import { type ReactNode, useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import NoteView from "@/components/notes/NoteView";
import DeleteConfirmModal from "@/components/notes/DeleteConfirmModal";
import Spinner from "@/components/ui/Spinner";
import { useNotesStore } from "@/stores/notes-store";

interface NotePageProps {
  params: Promise<{ id: string }>;
}

export default function NotePage({ params }: NotePageProps): ReactNode {
  const { id } = use(params);
  const router = useRouter();
  const { currentNote, isLoadingNote, error, fetchNote, deleteNote } =
    useNotesStore();
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    void fetchNote(id);
  }, [id, fetchNote]);

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteNote(id);
      router.push("/dashboard");
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete note",
      );
      setIsDeleting(false);
    }
  };

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
      {deleteError && (
        <div role="alert" className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {deleteError}
        </div>
      )}
      <NoteView
        note={currentNote}
        onDelete={() => setShowDelete(true)}
        isDeleting={isDeleting}
      />
      <DeleteConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title={currentNote.title}
        isDeleting={isDeleting}
      />
    </div>
  );
}
