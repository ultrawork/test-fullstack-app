import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { NoteEditor } from '../NoteEditor';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

const mockCreateNote = vi.fn().mockResolvedValue({ id: '1' });
const mockUpdateNote = vi.fn().mockResolvedValue({ id: '1' });

vi.mock('@/stores/notes-store', () => ({
  useNotesStore: () => ({
    createNote: mockCreateNote,
    updateNote: mockUpdateNote,
  }),
}));

vi.mock('@/stores/categories-store', () => ({
  useCategoriesStore: () => ({
    categories: [{ id: 'cat-1', name: 'Work', color: '#3b82f6', createdAt: '', updatedAt: '' }],
    fetchCategories: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('NoteEditor', () => {
  it('renders title and content fields', () => {
    render(<NoteEditor />);
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Content')).toBeInTheDocument();
  });

  it('renders category select', () => {
    render(<NoteEditor />);
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
  });

  it('renders create button in create mode', () => {
    render(<NoteEditor />);
    expect(screen.getByRole('button', { name: 'Create Note' })).toBeInTheDocument();
  });

  it('renders update button in edit mode', () => {
    const note = {
      id: '1',
      title: 'Existing',
      content: 'Content',
      categoryId: null,
      category: null,
      createdAt: '',
      updatedAt: '',
    };
    render(<NoteEditor note={note} />);
    expect(screen.getByRole('button', { name: 'Update Note' })).toBeInTheDocument();
  });

  it('shows validation error for empty title', async () => {
    render(<NoteEditor />);
    await userEvent.type(screen.getByLabelText('Content'), 'Some content');
    await userEvent.click(screen.getByRole('button', { name: 'Create Note' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('renders cancel button', () => {
    render(<NoteEditor />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
});
