import { create } from "zustand";
import type { User } from "@/types/auth";
import type { ApiResponse } from "@/types/api";
import { apiClient } from "@/lib/api-client";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<ApiResponse<User>>("/auth/login", {
        email,
        password,
      });
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Login failed",
      });
      throw err;
    }
  },

  register: async (email, name, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<ApiResponse<User>>("/auth/register", {
        email,
        name,
        password,
      });
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Registration failed",
      });
      throw err;
    }
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get<ApiResponse<User>>("/auth/me");
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
