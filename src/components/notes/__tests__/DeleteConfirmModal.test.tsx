import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { DeleteConfirmModal } from '../DeleteConfirmModal';

afterEach(() => {
  cleanup();
});

describe('DeleteConfirmModal', () => {
  it('renders nothing when not open', () => {
    render(
      <DeleteConfirmModal isOpen={false} noteTitle="Test" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.queryByText('Delete Note')).not.toBeInTheDocument();
  });

  it('renders title when open', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        noteTitle="My Note"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Delete Note')).toBeInTheDocument();
  });

  it('displays note title in confirmation message', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        noteTitle="My Note"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText(/My Note/)).toBeInTheDocument();
  });

  it('calls onConfirm when delete button clicked', async () => {
    const onConfirm = vi.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        noteTitle="My Note"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button clicked', async () => {
    const onCancel = vi.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        noteTitle="My Note"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
