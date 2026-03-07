import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import HomePage from "./page";

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: vi.fn(() => ({
    user: null,
    initialize: vi.fn(),
  })),
}));

afterEach(() => {
  cleanup();
});

describe("HomePage", () => {
  it("renders the heading", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Notes App" })
    ).toBeInTheDocument();
  });

  it("renders main element", () => {
    render(<HomePage />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("shows login form by default", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Sign In" })
    ).toBeInTheDocument();
  });
});
