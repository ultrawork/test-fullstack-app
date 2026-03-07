'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useCategoriesStore } from '@/stores/categories-store';
import type { Category } from '@/types/category';

export default function CategoriesPage(): ReactNode {
  const { categories, isLoading, fetchCategories, createCategory, updateCategory, deleteCategory } =
    useCategoriesStore();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async (data: { name: string; color?: string }): Promise<void> => {
    await createCategory(data);
  };

  const handleUpdate = async (data: { name: string; color?: string }): Promise<void> => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, data);
      setEditingCategory(null);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (deletingId) {
      await deleteCategory(deletingId);
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div data-testid="categories-page" className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Categories</h1>
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Add Category</h2>
        <CategoryForm onSubmit={handleCreate} />
      </section>
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Your Categories</h2>
        {categories.length === 0 ? (
          <p className="text-gray-500">No categories yet.</p>
        ) : (
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between rounded-md border border-gray-200 p-3"
              >
                <div className="flex items-center gap-2">
                  <Badge name={cat.name} color={cat.color} />
                  {cat._count && (
                    <span className="text-xs text-gray-400">
                      {cat._count.notes} note{cat._count.notes !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCategory(cat)}
                    aria-label={`Edit ${cat.name}`}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingId(cat.id)}
                    aria-label={`Delete ${cat.name}`}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editingCategory && (
        <Modal isOpen={true} onClose={() => setEditingCategory(null)} title="Edit Category">
          <CategoryForm
            category={editingCategory}
            onSubmit={handleUpdate}
            onCancel={() => setEditingCategory(null)}
          />
        </Modal>
      )}

      <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)} title="Delete Category">
        <p className="mb-6 text-gray-600">
          Are you sure you want to delete this category? Notes in this category will become
          uncategorized.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeletingId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
