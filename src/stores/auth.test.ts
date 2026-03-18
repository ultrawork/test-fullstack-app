import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAuthStore } from "./auth";
import { authApi } from "@/lib/api/auth";
import { httpClient } from "@/lib/api/http";

vi.mock("@/lib/api/auth", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    getMe: vi.fn(),
  },
}));

vi.mock("@/lib/api/http", () => ({
  httpClient: {
    setAccessToken: vi.fn(),
    clearAccessToken: vi.fn(),
  },
}));

describe("Auth Store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("has correct initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("login sets user and isAuthenticated on success", async () => {
    const mockUser = { id: "1", email: "user@example.com", role: "owner" as const };
    vi.mocked(authApi.login).mockResolvedValueOnce({
      accessToken: "token",
      user: mockUser,
    });

    await useAuthStore.getState().login({
      email: "user@example.com",
      password: "pass",
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("login sets error on failure", async () => {
    vi.mocked(authApi.login).mockRejectedValueOnce(new Error("Invalid credentials"));

    await useAuthStore.getState().login({
      email: "user@example.com",
      password: "wrong",
    });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe("Invalid credentials");
  });

  it("register sets user and isAuthenticated on success", async () => {
    const mockUser = { id: "2", email: "new@example.com", role: "owner" as const };
    vi.mocked(authApi.register).mockResolvedValueOnce({
      accessToken: "token",
      user: mockUser,
    });

    await useAuthStore.getState().register({
      email: "new@example.com",
      password: "pass",
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it("logout clears user and auth state", async () => {
    useAuthStore.setState({
      user: { id: "1", email: "user@example.com", role: "owner" },
      isAuthenticated: true,
    });

    vi.mocked(authApi.logout).mockResolvedValueOnce(undefined);

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(httpClient.clearAccessToken).toHaveBeenCalled();
  });

  it("checkAuth restores session from refresh token", async () => {
    const mockUser = { id: "1", email: "user@example.com", role: "owner" as const };
    vi.mocked(authApi.refresh).mockResolvedValueOnce({ accessToken: "token" });
    vi.mocked(authApi.getMe).mockResolvedValueOnce(mockUser);

    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it("checkAuth sets unauthenticated when refresh fails", async () => {
    vi.mocked(authApi.refresh).mockRejectedValueOnce(new Error("No session"));

    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it("does not store token in localStorage", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem");
    useAuthStore.setState({ user: { id: "1", email: "a@b.com", role: "owner" }, isAuthenticated: true });
    expect(spy).not.toHaveBeenCalledWith(
      expect.stringContaining("token"),
      expect.anything(),
    );
    spy.mockRestore();
  });

  it("isLoading is true during login", async () => {
    let resolveLogin: (value: unknown) => void;
    const loginPromise = new Promise((resolve) => { resolveLogin = resolve; });
    vi.mocked(authApi.login).mockReturnValueOnce(loginPromise as ReturnType<typeof authApi.login>);

    const loginAction = useAuthStore.getState().login({
      email: "user@example.com",
      password: "pass",
    });

    expect(useAuthStore.getState().isLoading).toBe(true);

    resolveLogin!({
      accessToken: "token",
      user: { id: "1", email: "user@example.com", role: "owner" },
    });
    await loginAction;

    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
