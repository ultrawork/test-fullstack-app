"use client";

import { type FormEvent, type ReactNode, useState, useEffect } from "react";
import { useCategoriesStore } from "@/stores/categories-store";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";

interface NoteEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialCategoryId?: string | null;
  isLoading?: boolean;
  onSubmit: (title: string, content: string, categoryId?: string) => void;
  submitLabel?: string;
}

export default function NoteEditor({
  initialTitle = "",
  initialContent = "",
  initialCategoryId = null,
  isLoading = false,
  onSubmit,
  submitLabel = "Save",
}: NoteEditorProps): ReactNode {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [categoryId, setCategoryId] = useState(initialCategoryId ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { categories, fetchCategories } = useCategoriesStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!content.trim()) newErrors.content = "Content is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(title.trim(), content.trim(), categoryId || undefined);
  };

  const resetForm = (): void => {
    setTitle("");
    setContent("");
    setCategoryId("");
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        required
      />
      <TextArea
        label="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        error={errors.content}
        required
      />
      <div className="space-y-1">
        <label
          htmlFor="category-select"
          className="block text-sm font-medium text-gray-700"
        >
          Category (optional)
        </label>
        <select
          id="category-select"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" isLoading={isLoading}>
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={resetForm}>
          Clear
        </Button>
      </div>
    </form>
  );
}
