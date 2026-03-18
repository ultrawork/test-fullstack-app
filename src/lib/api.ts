import type { AuthResponse, LoginCredentials, User } from "@/types/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

/** API error with status code */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const message = body || `HTTP ${response.status}`;
    throw new ApiError(message, response.status);
  }
  return response.json() as Promise<T>;
}

/** Authenticate user with email and password */
export async function loginRequest(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    credentials: "include",
  });
  return handleResponse<AuthResponse>(response);
}

/** End the current session */
export async function logoutRequest(): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    throw new ApiError("Logout failed", response.status);
  }
}

/** Get current authenticated user */
export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/me`, {
    credentials: "include",
  });
  return handleResponse<User>(response);
}
