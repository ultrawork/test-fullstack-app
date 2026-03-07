"use client";

import { create } from "zustand";
import type { User } from "@/types/auth";
import { apiClient } from "@/lib/api-client";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    confirmPassword: string,
    name?: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    const response = await apiClient.post<User>("/auth/login", {
      email,
      password,
    });
    if (response.success && response.data) {
      set({ user: response.data, isAuthenticated: true, isLoading: false });
      return true;
    }
    set({ isLoading: false, error: response.error ?? "Login failed" });
    return false;
  },

  register: async (email, password, confirmPassword, name) => {
    set({ isLoading: true, error: null });
    const response = await apiClient.post<User>("/auth/register", {
      email,
      password,
      confirmPassword,
      name,
    });
    if (response.success && response.data) {
      set({ user: response.data, isAuthenticated: true, isLoading: false });
      return true;
    }
    set({ isLoading: false, error: response.error ?? "Registration failed" });
    return false;
  },

  logout: async () => {
    await apiClient.post("/auth/logout");
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    const response = await apiClient.get<User>("/auth/me");
    if (response.success && response.data) {
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
