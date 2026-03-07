import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore } from "../auth-store";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import { apiClient } from "@/lib/api-client";

const mockedApiClient = vi.mocked(apiClient);

describe("useAuthStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
    });
  });

  it("should have initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  it("should login successfully", async () => {
    const mockUser = {
      id: "1",
      email: "test@example.com",
      name: "Test",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    };
    mockedApiClient.post.mockResolvedValue({
      success: true,
      data: mockUser,
    });

    const result = await useAuthStore.getState().login("test@example.com", "password123");

    expect(result).toBe(true);
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("should handle login failure", async () => {
    mockedApiClient.post.mockResolvedValue({
      success: false,
      error: "Invalid credentials",
    });

    const result = await useAuthStore.getState().login("test@example.com", "wrong");

    expect(result).toBe(false);
    expect(useAuthStore.getState().error).toBe("Invalid credentials");
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("should register successfully", async () => {
    const mockUser = {
      id: "2",
      email: "new@example.com",
      name: "New User",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    };
    mockedApiClient.post.mockResolvedValue({
      success: true,
      data: mockUser,
    });

    const result = await useAuthStore
      .getState()
      .register("new@example.com", "password123", "password123", "New User");

    expect(result).toBe(true);
    expect(useAuthStore.getState().user).toEqual(mockUser);
  });

  it("should logout", async () => {
    useAuthStore.setState({
      user: { id: "1", email: "t@t.com", name: null, createdAt: "", updatedAt: "" },
      isAuthenticated: true,
    });
    mockedApiClient.post.mockResolvedValue({ success: true });

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("should clearError", () => {
    useAuthStore.setState({ error: "Some error" });
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });
});
