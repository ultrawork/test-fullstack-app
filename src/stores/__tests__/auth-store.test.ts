import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../auth-store';

const mockApiClient = {
  post: vi.fn(),
  get: vi.fn(),
};

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    post: (...args: unknown[]) => mockApiClient.post(...args),
    get: (...args: unknown[]) => mockApiClient.get(...args),
  },
}));

describe('auth-store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  it('has correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  it('login sets user and isAuthenticated', async () => {
    const mockUser = { id: '1', email: 'test@test.com', createdAt: '2024-01-01' };
    mockApiClient.post.mockResolvedValue({ data: { user: mockUser } });

    await useAuthStore.getState().login('test@test.com', 'password');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('register sets user and isAuthenticated', async () => {
    const mockUser = { id: '1', email: 'test@test.com', createdAt: '2024-01-01' };
    mockApiClient.post.mockResolvedValue({ data: { user: mockUser } });

    await useAuthStore.getState().register('test@test.com', 'password', 'password');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('logout clears user', async () => {
    useAuthStore.setState({
      user: { id: '1', email: 'test@test.com', createdAt: '' },
      isAuthenticated: true,
    });
    mockApiClient.post.mockResolvedValue({});

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('logout clears user even when API fails', async () => {
    useAuthStore.setState({
      user: { id: '1', email: 'test@test.com', createdAt: '' },
      isAuthenticated: true,
    });
    mockApiClient.post.mockRejectedValue(new Error('Network error'));

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('checkAuth sets user when authenticated', async () => {
    const mockUser = { id: '1', email: 'test@test.com', createdAt: '2024-01-01' };
    mockApiClient.get.mockResolvedValue({ data: { user: mockUser } });

    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('checkAuth clears user when not authenticated', async () => {
    mockApiClient.get.mockRejectedValue(new Error('Unauthorized'));

    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });
});
