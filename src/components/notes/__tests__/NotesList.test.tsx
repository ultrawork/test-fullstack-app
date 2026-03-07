import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { NotesList } from '../NotesList';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockState = {
  notes: [] as unknown[],
  isLoading: false,
  error: null as string | null,
  total: 0,
  page: 1,
  filter: {},
  setPage: vi.fn(),
  deleteNote: vi.fn(),
};

vi.mock('@/stores/notes-store', () => ({
  useNotesStore: () => mockState,
}));

afterEach(() => {
  cleanup();
  mockState.notes = [];
  mockState.isLoading = false;
  mockState.total = 0;
});

describe('NotesList', () => {
  it('renders empty state when no notes', () => {
    render(<NotesList />);
    expect(screen.getByText('No notes yet')).toBeInTheDocument();
  });

  it('renders empty state CTA button', () => {
    render(<NotesList />);
    expect(screen.getByRole('button', { name: 'New Note' })).toBeInTheDocument();
  });

  it('renders spinner when loading', () => {
    mockState.isLoading = true;
    render(<NotesList />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders notes when available', () => {
    mockState.notes = [
      {
        id: '1',
        title: 'Note 1',
        content: 'Content',
        categoryId: null,
        category: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ];
    mockState.total = 1;
    render(<NotesList />);
    expect(screen.getByText('Note 1')).toBeInTheDocument();
  });
});
