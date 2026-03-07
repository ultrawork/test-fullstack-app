import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore } from "../auth-store";

// Mock the api-client
vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from "@/lib/api-client";

const mockedApi = vi.mocked(apiClient);

describe("AuthStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it("should have initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should login successfully", async () => {
    const mockUser = {
      id: "1",
      email: "test@test.com",
      name: "Test",
      createdAt: "2024-01-01",
    };
    mockedApi.post.mockResolvedValueOnce({
      success: true,
      data: { user: mockUser },
    });

    await useAuthStore.getState().login("test@test.com", "password");

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it("should handle login error", async () => {
    mockedApi.post.mockRejectedValueOnce(new Error("Invalid credentials"));

    await expect(
      useAuthStore.getState().login("test@test.com", "wrong"),
    ).rejects.toThrow();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe("Invalid credentials");
  });

  it("should register successfully", async () => {
    const mockUser = {
      id: "1",
      email: "test@test.com",
      name: "Test",
      createdAt: "2024-01-01",
    };
    mockedApi.post.mockResolvedValueOnce({
      success: true,
      data: { user: mockUser },
    });

    await useAuthStore
      .getState()
      .register("test@test.com", "Test", "password123");

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it("should logout", async () => {
    useAuthStore.setState({
      user: { id: "1", email: "t@t.com", name: "T", createdAt: "" },
      isAuthenticated: true,
    });
    mockedApi.post.mockResolvedValueOnce({});

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should fetch user", async () => {
    const mockUser = {
      id: "1",
      email: "test@test.com",
      name: "Test",
      createdAt: "2024-01-01",
    };
    mockedApi.get.mockResolvedValueOnce({
      success: true,
      data: { user: mockUser },
    });

    await useAuthStore.getState().fetchUser();

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it("should handle fetchUser error gracefully", async () => {
    mockedApi.get.mockRejectedValueOnce(new Error("Unauthorized"));

    await useAuthStore.getState().fetchUser();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should clear error", () => {
    useAuthStore.setState({ error: "some error" });
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });
});
