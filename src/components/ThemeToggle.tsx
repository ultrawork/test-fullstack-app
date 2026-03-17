"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";

/**
 * Renders a control for switching between light and dark themes.
 */
export default function ThemeToggle(): React.JSX.Element {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  useEffect((): void => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700"
      onClick={toggleTheme}
    >
      Toggle theme
    </button>
  );
}
