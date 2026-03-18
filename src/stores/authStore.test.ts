import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore } from "./authStore";
import type { User } from "@/types/auth";

const mockUser: User = {
  id: "1",
  email: "user@test.com",
  roles: ["ROLE_USER"],
};

vi.mock("@/lib/api", () => ({
  loginRequest: vi.fn(),
  logoutRequest: vi.fn(),
  getCurrentUser: vi.fn(),
}));

async function getApi(): Promise<{
  loginRequest: ReturnType<typeof vi.fn>;
  logoutRequest: ReturnType<typeof vi.fn>;
  getCurrentUser: ReturnType<typeof vi.fn>;
}> {
  return await import("@/lib/api") as {
    loginRequest: ReturnType<typeof vi.fn>;
    logoutRequest: ReturnType<typeof vi.fn>;
    getCurrentUser: ReturnType<typeof vi.fn>;
  };
}

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  it("has correct initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("login sets user on success", async () => {
    const api = await getApi();
    api.loginRequest.mockResolvedValueOnce({ user: mockUser, accessToken: "tok" });

    await useAuthStore.getState().login({ email: "user@test.com", password: "pass" });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("login sets error on failure", async () => {
    const api = await getApi();
    api.loginRequest.mockRejectedValueOnce(new Error("Invalid credentials"));

    await useAuthStore.getState().login({ email: "bad@test.com", password: "bad" });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe("Invalid credentials");
  });

  it("logout clears user state", async () => {
    const api = await getApi();
    api.logoutRequest.mockResolvedValueOnce(undefined);

    useAuthStore.setState({ user: mockUser, isAuthenticated: true });
    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("checkAuth sets user when session is valid", async () => {
    const api = await getApi();
    api.getCurrentUser.mockResolvedValueOnce(mockUser);

    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it("checkAuth clears user when session is invalid", async () => {
    const api = await getApi();
    api.getCurrentUser.mockRejectedValueOnce(new Error("Unauthorized"));

    useAuthStore.setState({ user: mockUser, isAuthenticated: true });
    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("clearError resets error to null", () => {
    useAuthStore.setState({ error: "Some error" });
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });
});
