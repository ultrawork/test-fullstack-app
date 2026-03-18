import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { authApi } from "./auth";
import { httpClient } from "./http";

vi.mock("./http", () => ({
  httpClient: {
    post: vi.fn(),
    get: vi.fn(),
    setAccessToken: vi.fn(),
    clearAccessToken: vi.fn(),
  },
}));

describe("Auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("login sends credentials and sets access token", async () => {
    const mockResponse = {
      accessToken: "token-123",
      user: { id: "1", email: "user@example.com", role: "owner" },
    };
    vi.mocked(httpClient.post).mockResolvedValueOnce(mockResponse);

    const result = await authApi.login({
      email: "user@example.com",
      password: "password123",
    });

    expect(httpClient.post).toHaveBeenCalledWith("/auth/login", {
      email: "user@example.com",
      password: "password123",
    });
    expect(httpClient.setAccessToken).toHaveBeenCalledWith("token-123");
    expect(result.user.email).toBe("user@example.com");
  });

  it("register sends registration data and sets access token", async () => {
    const mockResponse = {
      accessToken: "token-456",
      user: { id: "2", email: "new@example.com", role: "owner" },
    };
    vi.mocked(httpClient.post).mockResolvedValueOnce(mockResponse);

    const result = await authApi.register({
      email: "new@example.com",
      password: "securepass",
    });

    expect(httpClient.post).toHaveBeenCalledWith("/auth/register", {
      email: "new@example.com",
      password: "securepass",
    });
    expect(httpClient.setAccessToken).toHaveBeenCalledWith("token-456");
    expect(result.user.id).toBe("2");
  });

  it("logout clears access token", async () => {
    vi.mocked(httpClient.post).mockResolvedValueOnce(undefined);

    await authApi.logout();

    expect(httpClient.post).toHaveBeenCalledWith("/auth/logout");
    expect(httpClient.clearAccessToken).toHaveBeenCalled();
  });

  it("refresh calls refresh endpoint and updates token", async () => {
    const mockResponse = { accessToken: "refreshed-token" };
    vi.mocked(httpClient.post).mockResolvedValueOnce(mockResponse);

    const result = await authApi.refresh();

    expect(httpClient.post).toHaveBeenCalledWith("/auth/refresh");
    expect(httpClient.setAccessToken).toHaveBeenCalledWith("refreshed-token");
    expect(result.accessToken).toBe("refreshed-token");
  });

  it("getMe calls /auth/me endpoint", async () => {
    const mockUser = { id: "1", email: "user@example.com", role: "owner" };
    vi.mocked(httpClient.get).mockResolvedValueOnce(mockUser);

    const result = await authApi.getMe();

    expect(httpClient.get).toHaveBeenCalledWith("/auth/me");
    expect(result.email).toBe("user@example.com");
  });
});
