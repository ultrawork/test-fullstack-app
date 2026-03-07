"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotesStore } from "@/stores/notes-store";
import NoteView from "@/components/notes/NoteView";
import Spinner from "@/components/ui/Spinner";

interface NotePageProps {
  params: Promise<{ id: string }>;
}

export default function NotePage({ params }: NotePageProps): React.ReactNode {
  const { id } = use(params);
  const router = useRouter();
  const {
    selectedNote,
    isLoading,
    error,
    fetchNote,
    deleteNote,
    clearSelectedNote,
  } = useNotesStore();

  useEffect(() => {
    fetchNote(id);
    return () => clearSelectedNote();
  }, [id, fetchNote, clearSelectedNote]);

  const handleDelete = async (noteId: string): Promise<void> => {
    const success = await deleteNote(noteId);
    if (success) router.push("/dashboard");
  };

  if (isLoading) {
    return <Spinner size="lg" className="py-12" />;
  }

  if (!selectedNote) {
    return (
      <section className="py-12 text-center">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          {error ?? "Note not found"}
        </h2>
        <Link
          href="/dashboard"
          className="text-blue-600 hover:underline"
        >
          Back to notes
        </Link>
      </section>
    );
  }

  return <NoteView note={selectedNote} onDelete={handleDelete} />;
}
