'use client';

import { type FormEvent, type ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { useNotesStore } from '@/stores/notes-store';
import { useCategoriesStore } from '@/stores/categories-store';
import { createNoteSchema, updateNoteSchema } from '@/lib/validation';
import type { Note } from '@/types/note';
import type { ZodError } from 'zod';

interface NoteEditorProps {
  note?: Note;
}

export function NoteEditor({ note }: NoteEditorProps): ReactNode {
  const router = useRouter();
  const { createNote, updateNote } = useNotesStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [categoryId, setCategoryId] = useState(note?.categoryId || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setErrors({});

    const data = {
      title,
      content,
      ...(categoryId ? { categoryId } : {}),
    };

    try {
      if (note) {
        updateNoteSchema.parse(data);
      } else {
        createNoteSchema.parse(data);
      }
    } catch (err) {
      const zodErr = err as ZodError;
      const fieldErrors: Record<string, string> = {};
      zodErr.errors.forEach((e) => {
        const field = e.path[0] as string;
        fieldErrors[field] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      if (note) {
        await updateNote(note.id, {
          title,
          content,
          categoryId: categoryId || null,
        });
      } else {
        await createNote({
          title,
          content,
          ...(categoryId ? { categoryId } : {}),
        });
      }
      router.push('/dashboard');
    } catch {
      setErrors({ title: 'Failed to save note' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4" noValidate data-testid="note-editor-form">
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
        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category-select" data-testid="category-select"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          {note ? 'Update' : 'Create'} Note
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
