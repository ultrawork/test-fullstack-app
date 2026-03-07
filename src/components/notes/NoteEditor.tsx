"use client";

import { type ReactNode, type FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import TagSelector from "@/components/tags/TagSelector";
import { useNotesStore } from "@/stores/notes-store";
import { useTagsStore } from "@/stores/tags-store";
import type { Note } from "@/types/note";

interface NoteEditorProps {
  note?: Note;
}

export default function NoteEditor({ note }: NoteEditorProps): ReactNode {
  const router = useRouter();
  const { createNote, updateNote } = useNotesStore();
  const { tags, fetchTags, createTag } = useTagsStore();
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    note?.tags.map((t) => t.id) ?? [],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setErrors({});

    const fieldErrors: Record<string, string> = {};
    if (!title.trim()) fieldErrors.title = "Title is required";
    if (!content.trim()) fieldErrors.content = "Content is required";
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (note) {
        await updateNote(note.id, {
          title,
          content,
          tagIds: selectedTagIds,
        });
        router.push(`/dashboard/notes/${note.id}`);
      } else {
        const created = await createNote({
          title,
          content,
          tagIds: selectedTagIds,
        });
        router.push(`/dashboard/notes/${created.id}`);
      }
    } catch {
      setErrors({ form: "Failed to save note" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTag = async (name: string): Promise<void> => {
    const tag = await createTag({ name, color: "#3B82F6" });
    setSelectedTagIds((prev) => [...prev, tag.id]);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        error={errors.title}
        maxLength={255}
        required
      />

      <TextArea
        label="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note..."
        error={errors.content}
        required
      />

      <TagSelector
        tags={tags}
        selectedIds={selectedTagIds}
        onChange={setSelectedTagIds}
        onCreate={handleCreateTag}
      />

      {errors.form && (
        <p className="text-sm text-red-600" role="alert">
          {errors.form}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {note ? "Update" : "Create"} Note
        </Button>
      </div>
    </form>
  );
}
