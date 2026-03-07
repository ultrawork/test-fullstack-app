'use client';

import { type ReactNode } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  noteTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  noteTitle,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps): ReactNode {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Delete Note">
      <p className="mb-6 text-gray-600">
        Are you sure you want to delete &quot;{noteTitle}&quot;? This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
