import { create } from "zustand";
import type { AuthState, LoginCredentials } from "@/types/auth";
import { getCurrentUser, loginRequest, logoutRequest } from "@/lib/api";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await loginRequest(credentials);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed";
      set({ error: message, isLoading: false });
    }
  },

  logout: async (): Promise<void> => {
    try {
      await logoutRequest();
    } finally {
      set({ user: null, isAuthenticated: false, error: null });
    }
  },

  checkAuth: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      const user = await getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: (): void => {
    set({ error: null });
  },
}));
