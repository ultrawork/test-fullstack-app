import type { ApiResponse, PaginatedResponse } from "@/types/api";

class ApiClient {
  private baseUrl = "/api/v1";

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

    const response = await fetch(url, config);

    if (response.status === 401 && !endpoint.includes("/auth/")) {
      const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
      });

      if (refreshResponse.ok) {
        const retryResponse = await fetch(url, config);
        return retryResponse.json() as Promise<ApiResponse<T>>;
      }

      window.location.href = "/login";
      return { success: false, error: "Session expired" };
    }

    return response.json() as Promise<ApiResponse<T>>;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async getPaginated<T>(
    endpoint: string,
  ): Promise<PaginatedResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, { method: "GET" });

    if (response.status === 401) {
      const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
      });

      if (refreshResponse.ok) {
        const retryResponse = await fetch(url, { method: "GET" });
        return retryResponse.json() as Promise<PaginatedResponse<T>>;
      }

      window.location.href = "/login";
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
    }

    return response.json() as Promise<PaginatedResponse<T>>;
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
