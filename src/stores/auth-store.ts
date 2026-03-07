"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import type { AuthResponse, UserDTO, LoginInput, RegisterInput } from "@/types";

interface AuthState {
  user: UserDTO | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  initialize: (): void => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as UserDTO;
        set({ user, token });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  },

  login: async (input: LoginInput): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<AuthResponse>("/auth/login", input);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      set({ user: res.user, token: res.token, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Login failed",
        isLoading: false,
      });
    }
  },

  register: async (input: RegisterInput): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<AuthResponse>("/auth/register", input);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      set({ user: res.user, token: res.token, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Registration failed",
        isLoading: false,
      });
    }
  },

  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },
}));
