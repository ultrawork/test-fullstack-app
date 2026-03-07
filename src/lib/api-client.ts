const API_BASE = "/api/v1";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
    ...options,
  });

  if (response.status === 401 && !path.includes("/auth/")) {
    // Try refresh
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
    });
    if (refreshRes.ok) {
      const retryRes = await fetch(`${API_BASE}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers as Record<string, string>),
        },
        ...options,
      });
      if (!retryRes.ok) {
        const err = await retryRes.json();
        throw new Error(err.error || "Request failed");
      }
      return retryRes.json();
    }
    throw new Error("Session expired");
  }

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Request failed");
  }

  return response.json();
}

export const apiClient = {
  get: <T>(path: string): Promise<T> => request<T>(path),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string): Promise<T> =>
    request<T>(path, { method: "DELETE" }),
};
