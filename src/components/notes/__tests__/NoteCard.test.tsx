import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { NoteCard } from '../NoteCard';
import type { Note } from '@/types/note';

afterEach(() => {
  cleanup();
});

const mockNote: Note = {
  id: '1',
  title: 'Test Note',
  content: 'This is test content for the note card',
  categoryId: 'cat-1',
  category: { id: 'cat-1', name: 'Work', color: '#3b82f6', createdAt: '', updatedAt: '' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
};

describe('NoteCard', () => {
  it('renders note title', () => {
    render(<NoteCard note={mockNote} onDelete={vi.fn()} />);
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('renders content preview', () => {
    render(<NoteCard note={mockNote} onDelete={vi.fn()} />);
    expect(screen.getByText('This is test content for the note card')).toBeInTheDocument();
  });

  it('renders category badge', () => {
    render(<NoteCard note={mockNote} onDelete={vi.fn()} />);
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('renders link to note detail', () => {
    render(<NoteCard note={mockNote} onDelete={vi.fn()} />);
    const link = screen.getByRole('link', { name: 'Test Note' });
    expect(link).toHaveAttribute('href', '/dashboard/notes/1');
  });

  it('renders edit link', () => {
    render(<NoteCard note={mockNote} onDelete={vi.fn()} />);
    const editLink = screen.getByRole('link', { name: 'Edit Test Note' });
    expect(editLink).toHaveAttribute('href', '/dashboard/notes/1/edit');
  });

  it('calls onDelete with note id', async () => {
    const onDelete = vi.fn();
    render(<NoteCard note={mockNote} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete Test Note' }));
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('truncates long content', () => {
    const longNote = { ...mockNote, content: 'a'.repeat(200) };
    render(<NoteCard note={longNote} onDelete={vi.fn()} />);
    const preview = screen.getByText(/^a+\.\.\.$/);
    expect(preview).toBeInTheDocument();
  });
});
