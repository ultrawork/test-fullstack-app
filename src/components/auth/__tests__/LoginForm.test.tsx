import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import LoginForm from "../LoginForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock("next/link", () => {
  return {
    default: function MockLink({
      children,
      href,
    }: {
      children: React.ReactNode;
      href: string;
    }) {
      return <a href={href}>{children}</a>;
    },
  };
});

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: () => ({
    login: vi.fn(),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
});

describe("LoginForm", () => {
  it("should render email and password inputs", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("should render sign in button", () => {
    render(<LoginForm />);
    expect(
      screen.getByRole("button", { name: "Sign In" }),
    ).toBeInTheDocument();
  });

  it("should have link to register page", () => {
    render(<LoginForm />);
    expect(screen.getByText("Sign up")).toHaveAttribute("href", "/register");
  });

  it("should render email input with correct type", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
  });
});
