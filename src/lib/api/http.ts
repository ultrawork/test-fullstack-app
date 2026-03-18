import { getApiConfig, API_V2_PREFIX } from "./config";

/** Error thrown when an API request fails */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * HTTP client with automatic token refresh on 401 responses.
 *
 * - Access token is stored in-memory (never in localStorage).
 * - Refresh token is handled via httpOnly cookie (credentials: "include").
 * - Concurrent 401s trigger a single refresh request (singleton promise).
 */
class HttpClient {
  private accessToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;

  /** Set the in-memory access token */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /** Clear the in-memory access token */
  clearAccessToken(): void {
    this.accessToken = null;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }

  private buildUrl(path: string): string {
    const config = getApiConfig();
    return `${config.baseUrl}${API_V2_PREFIX}${path}`;
  }

  private buildHeaders(body?: unknown): Headers {
    const headers = new Headers();
    if (body !== undefined) {
      headers.set("Content-Type", "application/json");
    }
    if (this.accessToken) {
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    }
    return headers;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = this.buildUrl(path);
    const headers = this.buildHeaders(body);

    const response = await fetch(url, {
      method,
      headers,
      credentials: "include",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401 && !path.includes("/auth/refresh")) {
      return this.handleUnauthorized<T>(method, path, body);
    }

    if (!response.ok) {
      const errorBody = await response.text();
      throw new ApiError(response.status, errorBody || response.statusText);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  /**
   * Handle 401 by refreshing the access token (singleton) and retrying.
   * If refresh fails, clears the token and throws.
   */
  private async handleUnauthorized<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    try {
      const newToken = await this.refreshAccessToken();
      this.setAccessToken(newToken);
      return this.request<T>(method, path, body);
    } catch {
      this.clearAccessToken();
      throw new ApiError(401, "Session expired");
    }
  }

  /**
   * Singleton refresh: only one refresh request at a time.
   * Concurrent calls share the same promise.
   */
  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async doRefresh(): Promise<string> {
    const url = this.buildUrl("/auth/refresh");

    const response = await fetch(url, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new ApiError(response.status, "Token refresh failed");
    }

    const data = (await response.json()) as { accessToken: string };
    return data.accessToken;
  }
}

/** Singleton HTTP client instance */
export const httpClient = new HttpClient();
