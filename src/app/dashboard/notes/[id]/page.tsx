"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useNotesStore } from "@/stores/notes-store";
import NoteView from "@/components/notes/NoteView";
import Spinner from "@/components/ui/Spinner";

interface NotePageProps {
  params: Promise<{ id: string }>;
}

export default function NotePage({ params }: NotePageProps): React.ReactNode {
  const { id } = use(params);
  const router = useRouter();
  const { selectedNote, isLoading, fetchNote, deleteNote, clearSelectedNote } =
    useNotesStore();

  useEffect(() => {
    fetchNote(id);
    return () => clearSelectedNote();
  }, [id, fetchNote, clearSelectedNote]);

  const handleDelete = async (noteId: string): Promise<void> => {
    const success = await deleteNote(noteId);
    if (success) router.push("/dashboard");
  };

  if (isLoading || !selectedNote) {
    return <Spinner size="lg" className="py-12" />;
  }

  return <NoteView note={selectedNote} onDelete={handleDelete} />;
}
