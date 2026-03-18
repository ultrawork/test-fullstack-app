import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import LoginPage from "./page";
import { useAuthStore } from "@/stores/authStore";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/api", () => ({
  loginRequest: vi.fn(),
  logoutRequest: vi.fn(),
  getCurrentUser: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });
});

describe("LoginPage", () => {
  it("renders login form with email and password fields", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("renders the heading", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Sign in" }),
    ).toBeInTheDocument();
  });

  it("renders a form element", () => {
    render(<LoginPage />);
    expect(screen.getByRole("form")).toBeInTheDocument();
  });

  it("shows validation error for empty email", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("shows validation error for empty password", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "user@test.com");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("calls login on valid form submission", async () => {
    const { loginRequest } = await import("@/lib/api") as {
      loginRequest: ReturnType<typeof vi.fn>;
    };
    loginRequest.mockResolvedValueOnce({
      user: { id: "1", email: "user@test.com", roles: ["ROLE_USER"] },
      accessToken: "tok",
    });

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "user@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(loginRequest).toHaveBeenCalledWith({
      email: "user@test.com",
      password: "password123",
    });
  });

  it("displays server error from store", () => {
    useAuthStore.setState({ error: "Invalid credentials" });

    render(<LoginPage />);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials");
  });

  it("disables submit button when loading", () => {
    useAuthStore.setState({ isLoading: true });

    render(<LoginPage />);
    expect(screen.getByRole("button", { name: "Signing in…" })).toBeDisabled();
  });
});
