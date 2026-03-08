const API_BASE = "/api/v1";

let refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetch(`${API_BASE}/auth/refresh`, { method: "POST" })
    .then((res) => res.ok)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
    ...options,
  });

  if (response.status === 401 && !path.includes("/auth/")) {
    const refreshed = await refreshToken();
    if (refreshed) {
      const retryRes = await fetch(`${API_BASE}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers as Record<string, string>),
        },
        ...options,
      });
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => null);
        throw new Error(err?.error || "Request failed");
      }
      return retryRes.json();
    }
    throw new Error("Session expired");
  }

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || "Request failed");
  }

  return response.json();
}

async function uploadRequest<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
  });

  if (response.status === 401 && !path.includes("/auth/")) {
    const refreshed = await refreshToken();
    if (refreshed) {
      const retryRes = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        body: formData,
      });
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => null);
        throw new Error(err?.error || "Upload failed");
      }
      return retryRes.json();
    }
    throw new Error("Session expired");
  }

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || "Upload failed");
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
  upload: <T>(path: string, formData: FormData): Promise<T> =>
    uploadRequest<T>(path, formData),
};
