import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: vi.fn(() => ({
    register: vi.fn().mockResolvedValue(true),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  })),
}));

import RegisterPage from "./page";

afterEach(() => {
  cleanup();
});

describe("RegisterPage", () => {
  it("renders create account heading", () => {
    render(<RegisterPage />);
    expect(
      screen.getByRole("heading", { name: "Create your account" }),
    ).toBeInTheDocument();
  });

  it("renders registration form fields", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("renders sign in link", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });
});
