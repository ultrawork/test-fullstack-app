"use client";

import { type ReactNode, useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import DeleteConfirmModal from "@/components/notes/DeleteConfirmModal";
import CategoryList from "./CategoryList";
import CategoryForm from "./CategoryForm";
import type { CategoryWithNoteCount } from "@/types/category";
import { useCategoriesStore } from "@/stores/categories-store";

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalView = "list" | "create" | "edit";

export default function CategoryManagerModal({
  isOpen,
  onClose,
}: CategoryManagerModalProps): ReactNode {
  const [view, setView] = useState<ModalView>("list");
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithNoteCount | null>(null);
  const [deletingCategory, setDeletingCategory] =
    useState<CategoryWithNoteCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    categories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoriesStore();

  const loadCategories = useCallback((): void => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      setView("list");
      setEditingCategory(null);
    }
  }, [isOpen, loadCategories]);

  const handleCreate = async (data: {
    name: string;
    color: string;
  }): Promise<void> => {
    await createCategory(data);
    setView("list");
  };

  const handleEdit = (category: CategoryWithNoteCount): void => {
    setEditingCategory(category);
    setView("edit");
  };

  const handleUpdate = async (data: {
    name: string;
    color: string;
  }): Promise<void> => {
    if (!editingCategory) return;
    await updateCategory(editingCategory.id, data);
    setEditingCategory(null);
    setView("list");
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

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Manage Categories">
        {view === "list" && (
          <div className="flex flex-col gap-4">
            <CategoryList
              categories={categories}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <button
              type="button"
              onClick={() => setView("create")}
              className="self-start rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create New Category
            </button>
          </div>
        )}

        {view === "create" && (
          <CategoryForm
            onSubmit={handleCreate}
            onCancel={() => setView("list")}
          />
        )}

        {view === "edit" && editingCategory && (
          <CategoryForm
            initialName={editingCategory.name}
            initialColor={editingCategory.color}
            onSubmit={handleUpdate}
            onCancel={() => {
              setEditingCategory(null);
              setView("list");
            }}
            isEditing
          />
        )}
      </Modal>

      <DeleteConfirmModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
        title={deletingCategory?.name ?? ""}
        isDeleting={isDeleting}
      />
    </>
  );
}
