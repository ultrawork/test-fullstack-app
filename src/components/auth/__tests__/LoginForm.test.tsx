import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import LoginForm from "../LoginForm";

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: vi.fn(() => ({
    login: vi.fn().mockResolvedValue(true),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  })),
}));

afterEach(() => {
  cleanup();
});

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email and password fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<LoginForm />);
    expect(
      screen.getByRole("button", { name: "Sign In" }),
    ).toBeInTheDocument();
  });

  it("shows validation error for empty email", async () => {
    render(<LoginForm />);
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("shows validation error for empty password", async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText("Email");
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Email"), "invalid");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));
    expect(screen.getByText("Invalid email address")).toBeInTheDocument();
  });
});
