"use client";

import { useEffect } from "react";
import { useCategoriesStore } from "@/stores/categories-store";
import CategoryForm from "@/components/categories/CategoryForm";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

export default function CategoriesPage(): React.ReactNode {
  const {
    categories,
    isLoading,
    fetchCategories,
    createCategory,
    deleteCategory,
  } = useCategoriesStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async (name: string, color: string): Promise<void> => {
    await createCategory(name, color);
  };

  const handleDelete = async (id: string): Promise<void> => {
    await deleteCategory(id);
  };

  if (isLoading && categories.length === 0) {
    return <Spinner size="lg" className="py-12" />;
  }

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Categories</h1>
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">
          Add Category
        </h2>
        <CategoryForm onSubmit={handleCreate} submitLabel="Add" />
      </div>
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <Badge label={cat.name} color={cat.color} />
              <span className="text-sm text-gray-500">
                {cat._count?.notes ?? 0} notes
              </span>
            </div>
            <Button
              variant="danger"
              onClick={() => handleDelete(cat.id)}
              aria-label={`Delete category ${cat.name}`}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
