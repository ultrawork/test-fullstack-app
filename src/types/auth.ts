export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}
