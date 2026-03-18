/** User role identifier */
export type Role = "ROLE_USER" | "ROLE_ADMIN";

/** Authenticated user */
export interface User {
  id: string;
  email: string;
  roles: Role[];
}

/** Login request payload */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Auth API response after successful login */
export interface AuthResponse {
  user: User;
  accessToken: string;
}

/** Auth store state */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}
