import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: vi.fn(() => ({
    login: vi.fn().mockResolvedValue(true),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  })),
}));

import LoginPage from "./page";

afterEach(() => {
  cleanup();
});

describe("LoginPage", () => {
  it("renders welcome heading", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();
  });

  it("renders login form", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders sign up link", () => {
    render(<LoginPage />);
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });
});
