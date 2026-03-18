import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { Protected } from "./Protected";
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

describe("Protected", () => {
  it("shows loading spinner while checking auth", () => {
    useAuthStore.setState({ isLoading: true });

    render(
      <Protected>
        <p>Secret content</p>
      </Protected>,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "1", email: "u@t.com", roles: ["ROLE_USER"] },
    });

    render(
      <Protected>
        <p>Secret content</p>
      </Protected>,
    );

    expect(screen.getByText("Secret content")).toBeInTheDocument();
  });

  it("redirects to /login when not authenticated and not loading", () => {
    useAuthStore.setState({ isAuthenticated: false, isLoading: false });

    render(
      <Protected>
        <p>Secret content</p>
      </Protected>,
    );

    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("blocks access when user lacks required role", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "1", email: "u@t.com", roles: ["ROLE_USER"] },
    });

    render(
      <Protected requiredRoles={["ROLE_ADMIN"]}>
        <p>Admin only</p>
      </Protected>,
    );

    expect(screen.queryByText("Admin only")).not.toBeInTheDocument();
    expect(screen.getByText("Access denied")).toBeInTheDocument();
  });

  it("allows access when user has required role", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "1", email: "a@t.com", roles: ["ROLE_ADMIN", "ROLE_USER"] },
    });

    render(
      <Protected requiredRoles={["ROLE_ADMIN"]}>
        <p>Admin only</p>
      </Protected>,
    );

    expect(screen.getByText("Admin only")).toBeInTheDocument();
  });
});
