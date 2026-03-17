import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ThemeToggle from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.className = "";
  });

  afterEach(() => {
    cleanup();
    document.documentElement.className = "";
  });

  it("toggles dark mode class on the document element", () => {
    render(<ThemeToggle />);

    const toggleButton = screen.getByRole("button", {
      name: "Toggle dark mode",
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    fireEvent.click(toggleButton);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
