"use client";

import { type ReactNode, useState, useEffect } from "react";
import CategoryList from "@/components/categories/CategoryList";
import CategoryForm from "@/components/categories/CategoryForm";
import DeleteConfirmModal from "@/components/notes/DeleteConfirmModal";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useCategoriesStore } from "@/stores/categories-store";
import type { CategoryWithNoteCount } from "@/types/category";

export default function CategoriesPage(): ReactNode {
  const {
    categories,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoriesStore();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithNoteCount | null>(null);
  const [deletingCategory, setDeletingCategory] =
    useState<CategoryWithNoteCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async (data: {
    name: string;
    color: string;
  }): Promise<void> => {
    await createCategory(data);
    setShowForm(false);
  };

  const handleEdit = (category: CategoryWithNoteCount): void => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleUpdate = async (data: {
    name: string;
    color: string;
  }): Promise<void> => {
    if (!editingCategory) return;
    await updateCategory(editingCategory.id, data);
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleDelete = (category: CategoryWithNoteCount): void => {
    setDeletingCategory(category);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deletingCategory.id);
    } finally {
      setIsDeleting(false);
      setDeletingCategory(null);
    }
  };

  if (isLoading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>New Category</Button>
        )}
      </header>

      {showForm && (
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
          <CategoryForm
            key={editingCategory?.id ?? "new"}
            initialName={editingCategory?.name}
            initialColor={editingCategory?.color}
            onSubmit={editingCategory ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingCategory(null);
            }}
            isEditing={!!editingCategory}
          />
        </section>
      )}

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <CategoryList
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </section>

      <DeleteConfirmModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
        title={deletingCategory?.name ?? ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}
