'use client';

import { type FormEvent, type ReactNode, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createCategorySchema } from '@/lib/validation';
import type { Category } from '@/types/category';
import type { ZodError } from 'zod';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: { name: string; color?: string }) => Promise<void>;
  onCancel?: () => void;
}

export function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps): ReactNode {
  const [name, setName] = useState(category?.name || '');
  const [color, setColor] = useState(category?.color || '#3b82f6');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setErrors({});

    try {
      createCategorySchema.parse({ name, color });
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
      await onSubmit({ name, color });
      if (!category) {
        setName('');
        setColor('#3b82f6');
      }
    } catch (err) {
      setErrors({ name: err instanceof Error ? err.message : 'Failed to save' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <Input
          label="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="category-color" className="block text-sm font-medium text-gray-700">
          Color
        </label>
        <input
          id="category-color"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-10 w-10 cursor-pointer rounded border border-gray-300"
        />
      </div>
      <Button type="submit" loading={loading}>
        {category ? 'Update' : 'Add'}
      </Button>
      {onCancel && (
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </form>
  );
}
