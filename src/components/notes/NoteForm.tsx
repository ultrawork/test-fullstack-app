"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import TagSelector from "@/components/tags/TagSelector";
import { useTagsStore } from "@/stores/tags-store";
import type { NoteDTO } from "@/types";

interface NoteFormProps {
  note?: NoteDTO;
  onSubmit: (data: {
    title: string;
    content: string;
    tagIds: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

export default function NoteForm({
  note,
  onSubmit,
  onCancel,
}: NoteFormProps): React.ReactElement {
  const { tags, fetchTags } = useTagsStore();
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    note?.tags.map((t) => t.id) ?? []
  );
  const [errors, setErrors] = useState<{ title?: string; content?: string }>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const newErrors: { title?: string; content?: string } = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (title.length > 200)
      newErrors.title = "Title must be 200 characters or less";
    if (content.length > 50000)
      newErrors.content = "Content must be 50000 characters or less";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        content,
        tagIds: selectedTagIds,
      });
    } catch {
      setErrors({ title: "Failed to save note" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Title"
        name="note-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        maxLength={200}
        error={errors.title}
        required
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="note-content" className="text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          id="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note..."
          rows={6}
          maxLength={50000}
          className={`rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            errors.content ? "border-red-500" : ""
          }`}
          aria-describedby={errors.content ? "note-content-error" : undefined}
          aria-invalid={!!errors.content}
        />
        {errors.content && (
          <p id="note-content-error" className="text-sm text-red-600" role="alert">
            {errors.content}
          </p>
        )}
      </div>

      <TagSelector
        availableTags={tags}
        selectedTagIds={selectedTagIds}
        onChange={setSelectedTagIds}
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : note ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
