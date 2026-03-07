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
  const { currentNote, isLoading, fetchNote, deleteNote } = useNotesStore();
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    void fetchNote(id);
  }, [id, fetchNote]);

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true);
    try {
      await deleteNote(id);
      router.push("/dashboard");
    } finally {
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  if (isLoading || !currentNote) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
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
