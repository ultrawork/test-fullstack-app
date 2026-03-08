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

async function withAuthRetry<T>(
  fetchFn: () => Promise<Response>,
  path: string,
  errorMessage: string,
): Promise<T> {
  const response = await fetchFn();

  if (response.status === 401 && !path.includes("/auth/")) {
    const refreshed = await refreshToken();
    if (refreshed) {
      const retryRes = await fetchFn();
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => null);
        throw new Error(err?.error || errorMessage);
      }
      return retryRes.json();
    }
    throw new Error("Session expired");
  }

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || errorMessage);
  }

  return response.json();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  return withAuthRetry<T>(
    () =>
      fetch(`${API_BASE}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers as Record<string, string>),
        },
        ...options,
      }),
    path,
    "Request failed",
  );
}

async function uploadRequest<T>(path: string, formData: FormData): Promise<T> {
  return withAuthRetry<T>(
    () =>
      fetch(`${API_BASE}${path}`, {
        method: "POST",
        body: formData,
      }),
    path,
    "Upload failed",
  );
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
