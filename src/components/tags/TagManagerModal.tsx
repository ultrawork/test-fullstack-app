"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import TagForm from "./TagForm";
import TagList from "./TagList";
import { useTagsStore } from "@/stores/tags-store";
import type { TagWithCount } from "@/types";

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TagManagerModal({
  isOpen,
  onClose,
}: TagManagerModalProps): React.ReactElement {
  const {
    tagsWithCount,
    fetchTagsWithCount,
    createTag,
    updateTag,
    deleteTag,
  } = useTagsStore();

  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<TagWithCount | null>(null);

  const loadTags = useCallback((): void => {
    fetchTagsWithCount();
  }, [fetchTagsWithCount]);

  useEffect(() => {
    if (isOpen) loadTags();
  }, [isOpen, loadTags]);

  const handleCreate = async (data: {
    name: string;
    color: string;
  }): Promise<void> => {
    await createTag(data);
    setShowForm(false);
    loadTags();
  };

  const handleUpdate = async (data: {
    name: string;
    color: string;
  }): Promise<void> => {
    if (!editingTag) return;
    await updateTag(editingTag.id, data);
    setEditingTag(null);
    loadTags();
  };

  const handleDelete = async (tagId: string): Promise<void> => {
    await deleteTag(tagId);
    loadTags();
  };

  const handleEdit = (tag: TagWithCount): void => {
    setEditingTag(tag);
    setShowForm(false);
  };

  const handleClose = (): void => {
    setShowForm(false);
    setEditingTag(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Manage Tags">
      <section className="flex flex-col gap-4">
        {showForm && (
          <TagForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        )}

        {editingTag && (
          <TagForm
            tag={editingTag}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTag(null)}
          />
        )}

        {!showForm && !editingTag && (
          <>
            <Button onClick={() => setShowForm(true)} size="sm">
              + New Tag
            </Button>
            <TagList
              tags={tagsWithCount}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        )}
      </section>
    </Modal>
  );
}
