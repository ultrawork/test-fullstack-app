import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNotesStore } from '../notes-store';

const mockApiClient = {
  get: vi.fn(),
};

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: (...args: unknown[]) => mockApiClient.get(...args),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('notes-store sort', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNotesStore.setState({
      notes: [],
      selectedNote: null,
      filter: { sortBy: 'updatedAt', sortOrder: 'desc' },
      isLoading: false,
      error: null,
      total: 0,
      page: 1,
    });
  });

  it('has default sortBy and sortOrder in filter', () => {
    const state = useNotesStore.getState();
    expect(state.filter.sortBy).toBe('updatedAt');
    expect(state.filter.sortOrder).toBe('desc');
  });

  it('setFilter updates sortBy', () => {
    useNotesStore.getState().setFilter({ sortBy: 'title' });
    expect(useNotesStore.getState().filter.sortBy).toBe('title');
  });

  it('setFilter updates sortOrder', () => {
    useNotesStore.getState().setFilter({ sortOrder: 'asc' });
    expect(useNotesStore.getState().filter.sortOrder).toBe('asc');
  });

  it('setFilter resets page when sort changes', () => {
    useNotesStore.setState({ page: 3 });
    useNotesStore.getState().setFilter({ sortBy: 'title' });
    expect(useNotesStore.getState().page).toBe(1);
  });

  it('fetchNotes sends sortBy and sortOrder params', async () => {
    mockApiClient.get.mockResolvedValue({ data: [], total: 0 });

    useNotesStore.setState({
      filter: { sortBy: 'title', sortOrder: 'asc' },
    });

    await useNotesStore.getState().fetchNotes();

    const url = mockApiClient.get.mock.calls[0][0] as string;
    expect(url).toContain('sortBy=title');
    expect(url).toContain('sortOrder=asc');
  });

  it('fetchNotes sends default sort params', async () => {
    mockApiClient.get.mockResolvedValue({ data: [], total: 0 });

    await useNotesStore.getState().fetchNotes();

    const url = mockApiClient.get.mock.calls[0][0] as string;
    expect(url).toContain('sortBy=updatedAt');
    expect(url).toContain('sortOrder=desc');
  });
});
