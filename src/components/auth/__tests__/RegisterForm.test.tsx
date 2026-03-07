import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import RegisterForm from "../RegisterForm";

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
    register: vi.fn(),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
});

describe("RegisterForm", () => {
  it("should render name, email, and password inputs", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("should render create account button", () => {
    render(<RegisterForm />);
    expect(
      screen.getByRole("button", { name: "Create Account" }),
    ).toBeInTheDocument();
  });

  it("should have link to login page", () => {
    render(<RegisterForm />);
    expect(screen.getByText("Sign in")).toHaveAttribute("href", "/login");
  });

  it("should render password input with correct type", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
  });
});
