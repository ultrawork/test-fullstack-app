export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class AuthError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = "Validation failed",
    details?: Record<string, string[]>,
  ) {
    super(message, 400, details);
    this.name = "ValidationError";
  }
}
