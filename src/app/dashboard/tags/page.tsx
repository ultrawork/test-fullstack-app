"use client";

import { type ReactNode, useState, useEffect } from "react";
import TagList from "@/components/tags/TagList";
import TagForm from "@/components/tags/TagForm";
import DeleteConfirmModal from "@/components/notes/DeleteConfirmModal";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useTagsStore } from "@/stores/tags-store";
import type { TagWithNoteCount } from "@/types/tag";

export default function TagsPage(): ReactNode {
  const { tags, isLoading, fetchTags, createTag, updateTag, deleteTag } =
    useTagsStore();
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<TagWithNoteCount | null>(null);
  const [deletingTag, setDeletingTag] = useState<TagWithNoteCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  const handleCreate = async (data: {
    name: string;
    color: string;
  }): Promise<void> => {
    await createTag(data);
    setShowForm(false);
  };

  const handleEdit = (tag: TagWithNoteCount): void => {
    setEditingTag(tag);
    setShowForm(true);
  };

  const handleUpdate = async (data: {
    name: string;
    color: string;
  }): Promise<void> => {
    if (!editingTag) return;
    await updateTag(editingTag.id, data);
    setEditingTag(null);
    setShowForm(false);
  };

  const handleDelete = (tag: TagWithNoteCount): void => {
    setDeletingTag(tag);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deletingTag) return;
    setIsDeleting(true);
    try {
      await deleteTag(deletingTag.id);
    } finally {
      setIsDeleting(false);
      setDeletingTag(null);
    }
  };

  if (isLoading && tags.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Tags</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>New Tag</Button>
        )}
      </header>

      {showForm && (
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
          <TagForm
            key={editingTag?.id ?? "create"}
            initialName={editingTag?.name}
            initialColor={editingTag?.color}
            onSubmit={editingTag ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingTag(null);
            }}
            isEditing={!!editingTag}
          />
        </section>
      )}

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <TagList tags={tags} onEdit={handleEdit} onDelete={handleDelete} />
      </section>

      <DeleteConfirmModal
        isOpen={!!deletingTag}
        onClose={() => setDeletingTag(null)}
        onConfirm={handleConfirmDelete}
        title={deletingTag?.name ?? ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}
