import type { ApiResponse, PaginatedResponse } from "@/types/api";

class ApiClient {
  private baseUrl = "/api/v1";

  private async fetchWithRetry(
    url: string,
    config: RequestInit,
  ): Promise<Response> {
    const response = await fetch(url, config);

    if (response.status === 401 && !url.includes("/auth/")) {
      const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
      });

      if (refreshResponse.ok) {
        return fetch(url, config);
      }

      window.location.href = "/login";
      throw new Error("Session expired");
    }

    return response;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await this.fetchWithRetry(url, config);
      return response.json() as Promise<ApiResponse<T>>;
    } catch {
      return { success: false, error: "Network error" };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async getPaginated<T>(
    endpoint: string,
  ): Promise<PaginatedResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response = await this.fetchWithRetry(url, { method: "GET" });
      return response.json() as Promise<PaginatedResponse<T>>;
    } catch {
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
    }
  }

  async post<T>(
    endpoint: string,
    data?: Record<string, unknown>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data: Record<string, unknown>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
