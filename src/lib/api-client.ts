import type { ApiError } from '@/types/api';

class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => ({ error: 'Request failed' }))) as ApiError;
    throw new ApiClientError(body.error || 'Request failed', response.status);
  }
  return response.json() as Promise<T>;
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch('/api/v1/auth/refresh', { method: 'POST' })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const SKIP_REFRESH_URLS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];
  const shouldSkipRefresh = SKIP_REFRESH_URLS.some((path) => url.includes(path));

  if (response.status === 401 && !shouldSkipRefresh) {
    const refreshed = await refreshToken();
    if (refreshed) {
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      return handleResponse<T>(retryResponse);
    }
    throw new ApiClientError('Unauthorized', 401);
  }

  return handleResponse<T>(response);
}

export const apiClient = {
  get<T>(url: string): Promise<T> {
    return request<T>(url);
  },

  post<T>(url: string, body?: unknown): Promise<T> {
    return request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(url: string, body?: unknown): Promise<T> {
    return request<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(url: string): Promise<T> {
    return request<T>(url, { method: 'DELETE' });
  },
};

export { ApiClientError };
