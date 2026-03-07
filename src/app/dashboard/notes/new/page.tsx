"use client";

import { useRouter } from "next/navigation";
import { useNotesStore } from "@/stores/notes-store";
import NoteEditor from "@/components/notes/NoteEditor";

export default function NewNotePage(): React.ReactNode {
  const router = useRouter();
  const { createNote, isLoading } = useNotesStore();

  const handleSubmit = async (
    title: string,
    content: string,
    categoryId?: string,
  ): Promise<void> => {
    const note = await createNote(title, content, categoryId);
    if (note) {
      router.push(`/dashboard/notes/${note.id}`);
    }
  };

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Create Note</h1>
      <NoteEditor
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Create Note"
      />
    </section>
  );
}
