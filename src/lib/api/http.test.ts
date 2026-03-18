import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { httpClient } from "./http";

const mockFetch = vi.fn();

describe("HTTP Client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends GET request with correct URL", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: "ok" }), { status: 200 }),
    );

    await httpClient.get("/notes");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v2/notes"),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("sends POST request with JSON body", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "1" }), { status: 201 }),
    );

    const body = { title: "Test", content: "Hello" };
    await httpClient.post("/notes", body);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v2/notes"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
  });

  it("includes credentials in all requests (for httpOnly cookies)", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await httpClient.get("/notes");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("sets Content-Type header to application/json", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await httpClient.post("/notes", { title: "Test" });

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.get("Content-Type")).toBe("application/json");
  });

  it("includes access token in Authorization header when set", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    httpClient.setAccessToken("test-token-123");
    await httpClient.get("/notes");

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.get("Authorization")).toBe("Bearer test-token-123");
  });

  it("does not include Authorization header when no token set", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    httpClient.clearAccessToken();
    await httpClient.get("/notes");

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.get("Authorization")).toBeNull();
  });

  it("attempts token refresh on 401 response", async () => {
    // First call returns 401
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    );
    // Refresh call succeeds
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ accessToken: "new-token" }), {
        status: 200,
      }),
    );
    // Retry call succeeds
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: "ok" }), { status: 200 }),
    );

    httpClient.setAccessToken("expired-token");
    const result = await httpClient.get<{ data: string }>("/notes");

    expect(result.data).toBe("ok");
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("uses singleton refresh — concurrent 401s trigger only one refresh", async () => {
    // Both calls return 401
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    );
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    );
    // Single refresh call
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ accessToken: "new-token" }), {
        status: 200,
      }),
    );
    // Two retries
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: "ok1" }), { status: 200 }),
    );
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: "ok2" }), { status: 200 }),
    );

    httpClient.setAccessToken("expired-token");
    const [r1, r2] = await Promise.all([
      httpClient.get<{ data: string }>("/notes"),
      httpClient.get<{ data: string }>("/categories"),
    ]);

    expect(r1.data).toBe("ok1");
    expect(r2.data).toBe("ok2");

    // Count refresh calls (POST to /auth/refresh)
    const refreshCalls = mockFetch.mock.calls.filter(
      ([url, opts]: [string, RequestInit]) =>
        url.includes("/auth/refresh") && opts.method === "POST",
    );
    expect(refreshCalls).toHaveLength(1);
  });

  it("throws on 401 if refresh also fails", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    );
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Invalid refresh token" }), {
        status: 401,
      }),
    );

    httpClient.setAccessToken("expired-token");

    await expect(httpClient.get("/notes")).rejects.toThrow();
  });

  it("sends PUT request", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "1" }), { status: 200 }),
    );

    await httpClient.put("/notes/1", { title: "Updated" });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v2/notes/1"),
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("sends DELETE request", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(null, { status: 204 }),
    );

    await httpClient.delete("/notes/1");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v2/notes/1"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
