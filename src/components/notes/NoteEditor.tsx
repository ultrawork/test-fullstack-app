"use client";

import { type ReactNode, type FormEvent, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import TagSelector from "@/components/tags/TagSelector";
import ImageUploader from "@/components/notes/ImageUploader";
import { useNotesStore } from "@/stores/notes-store";
import { useTagsStore } from "@/stores/tags-store";
import type { Note } from "@/types/note";

interface NoteEditorProps {
  note?: Note;
}

export default function NoteEditor({ note }: NoteEditorProps): ReactNode {
  const router = useRouter();
  const { createNote, updateNote, uploadImages, deleteImage } =
    useNotesStore();
  const { tags, fetchTags, createTag } = useTagsStore();
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    note?.tags.map((t) => t.id) ?? [],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingImages, setPendingImages] = useState<File[]>([]);

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  const handleUpload = async (files: File[]): Promise<void> => {
    if (!note) return;
    setIsUploading(true);
    try {
      await uploadImages(note.id, files);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string): Promise<void> => {
    if (!note) return;
    await deleteImage(note.id, imageId);
  };

  const handlePendingChange = useCallback((files: File[]): void => {
    setPendingImages(files);
  }, []);

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
        if (pendingImages.length > 0) {
          try {
            await uploadImages(created.id, pendingImages);
          } catch {
            setErrors({ form: "Note created, but image upload failed" });
            router.push(`/dashboard/notes/${created.id}`);
            return;
          }
        }
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

      <ImageUploader
        existingImages={note?.images ?? []}
        onUpload={handleUpload}
        onDelete={handleDeleteImage}
        onPendingChange={!note ? handlePendingChange : undefined}
        isUploading={isUploading}
        immediateUpload={!!note}
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
