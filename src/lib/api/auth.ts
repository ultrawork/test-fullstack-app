import { httpClient } from "./http";

export interface User {
  id: string;
  email: string;
  role: "owner" | "viewer";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}

/** Auth API methods for login, register, logout, refresh, and profile */
export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>(
      "/auth/login",
      credentials,
    );
    httpClient.setAccessToken(response.accessToken);
    return response;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>(
      "/auth/register",
      data,
    );
    httpClient.setAccessToken(response.accessToken);
    return response;
  },

  async logout(): Promise<void> {
    await httpClient.post("/auth/logout");
    httpClient.clearAccessToken();
  },

  async refresh(): Promise<RefreshResponse> {
    const response = await httpClient.post<RefreshResponse>("/auth/refresh");
    httpClient.setAccessToken(response.accessToken);
    return response;
  },

  async getMe(): Promise<User> {
    return httpClient.get<User>("/auth/me");
  },
};
