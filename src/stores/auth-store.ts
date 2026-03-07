import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import type { User } from '@/types/auth';
import type { ApiResponse } from '@/types/api';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string): Promise<void> => {
    const response = await apiClient.post<ApiResponse<{ user: User }>>('/api/v1/auth/login', {
      email,
      password,
    });
    set({ user: response.data.user, isAuthenticated: true });
  },

  register: async (email: string, password: string, confirmPassword: string): Promise<void> => {
    const response = await apiClient.post<ApiResponse<{ user: User }>>('/api/v1/auth/register', {
      email,
      password,
      confirmPassword,
    });
    set({ user: response.data.user, isAuthenticated: true });
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async (): Promise<void> => {
    try {
      const response = await apiClient.get<ApiResponse<{ user: User }>>('/api/v1/auth/me');
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
