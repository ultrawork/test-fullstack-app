/**
 * Base application error class.
 * All custom errors in the application extend this class.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /** Serialize error for JSON responses. */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
    };
  }
}

/** Validation error (400) with optional per-field details. */
export class ValidationError extends AppError {
  public readonly fieldErrors?: Record<string, string>;

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      ...(this.fieldErrors && { fieldErrors: this.fieldErrors }),
    };
  }
}

/** Resource not found error (404). */
export class NotFoundError extends AppError {
  public readonly resource?: string;
  public readonly resourceId?: string;

  constructor(message: string, resource?: string, resourceId?: string) {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
    this.resource = resource;
    this.resourceId = resourceId;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      ...(this.resource && { resource: this.resource }),
      ...(this.resourceId && { resourceId: this.resourceId }),
    };
  }
}

/** Conflict error (409) — duplicate entries, version conflicts, etc. */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

/** Unauthorized error (401) — missing or invalid credentials. */
export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

/** Forbidden error (403) — authenticated but insufficient permissions. */
export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

/** Authentication-specific error with customizable code and status. */
export class AuthError extends AppError {
  constructor(
    message: string,
    code: string = "AUTH_ERROR",
    statusCode: number = 401
  ) {
    super(message, statusCode, code);
    this.name = "AuthError";
  }
}

/**
 * Normalize any thrown value into an AppError.
 * Returns AppError instances as-is; wraps native Errors and other values.
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, 500, "INTERNAL_ERROR");
  }

  if (typeof error === "string") {
    return new AppError(error, 500, "INTERNAL_ERROR");
  }

  return new AppError("Unknown error", 500, "INTERNAL_ERROR");
}
