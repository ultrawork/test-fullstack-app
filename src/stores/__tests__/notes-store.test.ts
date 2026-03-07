import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNotesStore } from '../notes-store';

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: (...args: unknown[]) => mockApiClient.get(...args),
    post: (...args: unknown[]) => mockApiClient.post(...args),
    put: (...args: unknown[]) => mockApiClient.put(...args),
    delete: (...args: unknown[]) => mockApiClient.delete(...args),
  },
}));

const mockNote = {
  id: '1',
  title: 'Test Note',
  content: 'Content',
  categoryId: null,
  category: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('notes-store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNotesStore.setState({
      notes: [],
      selectedNote: null,
      filter: {},
      isLoading: false,
      error: null,
      total: 0,
      page: 1,
    });
  });

  it('has correct initial state', () => {
    const state = useNotesStore.getState();
    expect(state.notes).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.total).toBe(0);
    expect(state.page).toBe(1);
  });

  it('fetchNotes loads notes', async () => {
    mockApiClient.get.mockResolvedValue({ data: [mockNote], total: 1 });

    await useNotesStore.getState().fetchNotes();

    const state = useNotesStore.getState();
    expect(state.notes).toEqual([mockNote]);
    expect(state.total).toBe(1);
    expect(state.isLoading).toBe(false);
  });

  it('fetchNote loads single note', async () => {
    mockApiClient.get.mockResolvedValue({ data: mockNote });

    await useNotesStore.getState().fetchNote('1');

    expect(useNotesStore.getState().selectedNote).toEqual(mockNote);
  });

  it('createNote adds note to list', async () => {
    mockApiClient.post.mockResolvedValue({ data: mockNote });

    await useNotesStore.getState().createNote({ title: 'Test', content: 'Content' });

    expect(useNotesStore.getState().notes).toHaveLength(1);
  });

  it('updateNote updates note in list', async () => {
    useNotesStore.setState({ notes: [mockNote] });
    const updated = { ...mockNote, title: 'Updated' };
    mockApiClient.put.mockResolvedValue({ data: updated });

    await useNotesStore.getState().updateNote('1', { title: 'Updated' });

    expect(useNotesStore.getState().notes[0].title).toBe('Updated');
  });

  it('deleteNote removes note from list', async () => {
    useNotesStore.setState({ notes: [mockNote] });
    mockApiClient.delete.mockResolvedValue({});

    await useNotesStore.getState().deleteNote('1');

    expect(useNotesStore.getState().notes).toHaveLength(0);
  });

  it('setFilter updates filter and resets page', () => {
    useNotesStore.setState({ page: 3 });
    useNotesStore.getState().setFilter({ search: 'test' });

    const state = useNotesStore.getState();
    expect(state.filter.search).toBe('test');
    expect(state.page).toBe(1);
  });

  it('setPage updates page', () => {
    useNotesStore.getState().setPage(5);
    expect(useNotesStore.getState().page).toBe(5);
  });
});
