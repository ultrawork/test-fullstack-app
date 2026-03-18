import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { NavBar } from "./NavBar";
import { useAuthStore } from "@/stores/authStore";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
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

describe("NavBar", () => {
  it("renders navigation element", () => {
    render(<NavBar />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("renders app name link", () => {
    render(<NavBar />);
    expect(screen.getByRole("link", { name: "Notes App" })).toBeInTheDocument();
  });

  it("shows sign in link when not authenticated", () => {
    render(<NavBar />);
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sign out" })).not.toBeInTheDocument();
  });

  it("shows sign out button when authenticated", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "1", email: "u@t.com", roles: ["ROLE_USER"] },
    });

    render(<NavBar />);
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
  });

  it("shows admin link only for admin users", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "1", email: "a@t.com", roles: ["ROLE_ADMIN", "ROLE_USER"] },
    });

    render(<NavBar />);
    expect(screen.getByRole("link", { name: "Admin" })).toBeInTheDocument();
  });

  it("hides admin link for regular users", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "1", email: "u@t.com", roles: ["ROLE_USER"] },
    });

    render(<NavBar />);
    expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();
  });

  it("displays user email when authenticated", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "1", email: "hello@test.com", roles: ["ROLE_USER"] },
    });

    render(<NavBar />);
    expect(screen.getByText("hello@test.com")).toBeInTheDocument();
  });

  it("clears auth state when sign out button is clicked", async () => {
    const { getCurrentUser, logoutRequest } = await import("@/lib/api") as {
      getCurrentUser: ReturnType<typeof vi.fn>;
      logoutRequest: ReturnType<typeof vi.fn>;
    };
    const testUser = { id: "1", email: "u@t.com", roles: ["ROLE_USER"] as const };
    getCurrentUser.mockResolvedValue(testUser);
    logoutRequest.mockResolvedValue(undefined);

    useAuthStore.setState({
      isAuthenticated: true,
      user: testUser,
    });

    const user = userEvent.setup();
    render(<NavBar />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    });
  });
});
