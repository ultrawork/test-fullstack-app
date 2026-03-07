import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCategoriesStore } from '../categories-store';

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

const mockCategory = {
  id: '1',
  name: 'Work',
  color: '#3b82f6',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('categories-store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCategoriesStore.setState({ categories: [], isLoading: false });
  });

  it('has correct initial state', () => {
    const state = useCategoriesStore.getState();
    expect(state.categories).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it('fetchCategories loads categories', async () => {
    mockApiClient.get.mockResolvedValue({ data: [mockCategory] });

    await useCategoriesStore.getState().fetchCategories();

    expect(useCategoriesStore.getState().categories).toEqual([mockCategory]);
  });

  it('createCategory adds category', async () => {
    mockApiClient.post.mockResolvedValue({ data: mockCategory });

    await useCategoriesStore.getState().createCategory({ name: 'Work', color: '#3b82f6' });

    expect(useCategoriesStore.getState().categories).toHaveLength(1);
  });

  it('updateCategory updates category', async () => {
    useCategoriesStore.setState({ categories: [mockCategory] });
    const updated = { ...mockCategory, name: 'Personal' };
    mockApiClient.put.mockResolvedValue({ data: updated });

    await useCategoriesStore.getState().updateCategory('1', { name: 'Personal' });

    expect(useCategoriesStore.getState().categories[0].name).toBe('Personal');
  });

  it('deleteCategory removes category', async () => {
    useCategoriesStore.setState({ categories: [mockCategory] });
    mockApiClient.delete.mockResolvedValue({});

    await useCategoriesStore.getState().deleteCategory('1');

    expect(useCategoriesStore.getState().categories).toHaveLength(0);
  });
});
