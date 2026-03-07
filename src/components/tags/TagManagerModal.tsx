"use client";

import { type ReactNode, useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import DeleteConfirmModal from "@/components/notes/DeleteConfirmModal";
import TagList from "./TagList";
import TagForm from "./TagForm";
import type { TagWithNoteCount } from "@/types/tag";
import { useTagsStore } from "@/stores/tags-store";

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalView = "list" | "create" | "edit";

export default function TagManagerModal({
  isOpen,
  onClose,
}: TagManagerModalProps): ReactNode {
  const [view, setView] = useState<ModalView>("list");
  const [editingTag, setEditingTag] = useState<TagWithNoteCount | null>(null);
  const [deletingTag, setDeletingTag] = useState<TagWithNoteCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { tags, fetchTags, createTag, updateTag, deleteTag } = useTagsStore();

  const loadTags = useCallback((): void => {
    void fetchTags();
  }, [fetchTags]);

  useEffect(() => {
    if (isOpen) {
      loadTags();
      setView("list");
      setEditingTag(null);
    }
  }, [isOpen, loadTags]);

  const handleCreate = async (data: {
    name: string;
    color: string;
  }): Promise<void> => {
    await createTag(data);
    setView("list");
  };

  const handleEdit = (tag: TagWithNoteCount): void => {
    setEditingTag(tag);
    setView("edit");
  };

  const handleUpdate = async (data: {
    name: string;
    color: string;
  }): Promise<void> => {
    if (!editingTag) return;
    await updateTag(editingTag.id, data);
    setEditingTag(null);
    setView("list");
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

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Manage Tags">
        {view === "list" && (
          <div className="flex flex-col gap-4">
            <TagList tags={tags} onEdit={handleEdit} onDelete={handleDelete} />
            <button
              type="button"
              onClick={() => setView("create")}
              className="self-start rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create New Tag
            </button>
          </div>
        )}

        {view === "create" && (
          <TagForm onSubmit={handleCreate} onCancel={() => setView("list")} />
        )}

        {view === "edit" && editingTag && (
          <TagForm
            initialName={editingTag.name}
            initialColor={editingTag.color}
            onSubmit={handleUpdate}
            onCancel={() => {
              setEditingTag(null);
              setView("list");
            }}
            isEditing
          />
        )}
      </Modal>

      <DeleteConfirmModal
        isOpen={!!deletingTag}
        onClose={() => setDeletingTag(null)}
        onConfirm={handleConfirmDelete}
        title={deletingTag?.name ?? ""}
        isDeleting={isDeleting}
      />
    </>
  );
}
