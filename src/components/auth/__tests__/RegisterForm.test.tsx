import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import RegisterForm from "../RegisterForm";

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: vi.fn(() => ({
    register: vi.fn().mockResolvedValue(true),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  })),
}));

afterEach(() => {
  cleanup();
});

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all required fields", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText("Name (optional)")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<RegisterForm />);
    expect(
      screen.getByRole("button", { name: "Create Account" }),
    ).toBeInTheDocument();
  });

  it("shows validation error for empty email", async () => {
    render(<RegisterForm />);
    await userEvent.click(
      screen.getByRole("button", { name: "Create Account" }),
    );
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("shows validation error for short password", async () => {
    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "short");
    await userEvent.type(screen.getByLabelText("Confirm Password"), "short");
    await userEvent.click(
      screen.getByRole("button", { name: "Create Account" }),
    );
    expect(
      screen.getByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
  });

  it("shows validation error for mismatched passwords", async () => {
    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.type(
      screen.getByLabelText("Confirm Password"),
      "different123",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Create Account" }),
    );
    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
  });
});
