"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useNotesStore } from "@/stores/notes-store";
import NoteEditor from "@/components/notes/NoteEditor";
import Spinner from "@/components/ui/Spinner";

interface EditNotePageProps {
  params: Promise<{ id: string }>;
}

export default function EditNotePage({
  params,
}: EditNotePageProps): React.ReactNode {
  const { id } = use(params);
  const router = useRouter();
  const { selectedNote, isLoading, fetchNote, updateNote, clearSelectedNote } =
    useNotesStore();

  useEffect(() => {
    fetchNote(id);
    return () => clearSelectedNote();
  }, [id, fetchNote, clearSelectedNote]);

  const handleSubmit = async (
    title: string,
    content: string,
    categoryId?: string,
  ): Promise<void> => {
    const note = await updateNote(id, {
      title,
      content,
      categoryId: categoryId ?? null,
    });
    if (note) router.push(`/dashboard/notes/${id}`);
  };

  if (isLoading || !selectedNote) {
    return <Spinner size="lg" className="py-12" />;
  }

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Note</h1>
      <NoteEditor
        initialTitle={selectedNote.title}
        initialContent={selectedNote.content}
        initialCategoryId={selectedNote.categoryId}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Update Note"
      />
    </section>
  );
}
