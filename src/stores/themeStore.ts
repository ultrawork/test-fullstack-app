import { create } from "zustand";

export type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

/**
 * Stores the current UI theme and exposes update actions.
 */
export const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",
  setTheme: (theme: Theme) => set({ theme }),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),
}));
