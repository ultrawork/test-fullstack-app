import { describe, it, expect } from "vitest";
import {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  AuthError,
  normalizeError,
} from "./errors";

describe("AppError", () => {
  it("creates an error with message and default status 500", () => {
    const error = new AppError("something went wrong");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("something went wrong");
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe("INTERNAL_ERROR");
    expect(error.name).toBe("AppError");
  });

  it("creates an error with custom status and code", () => {
    const error = new AppError("custom error", 418, "TEAPOT");
    expect(error.statusCode).toBe(418);
    expect(error.code).toBe("TEAPOT");
  });

  it("captures stack trace", () => {
    const error = new AppError("trace test");
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("trace test");
  });

  it("serializes to JSON correctly", () => {
    const error = new AppError("json test", 500, "INTERNAL_ERROR");
    const json = error.toJSON();
    expect(json).toEqual({
      name: "AppError",
      message: "json test",
      statusCode: 500,
      code: "INTERNAL_ERROR",
    });
  });
});

describe("ValidationError", () => {
  it("creates a validation error with status 400", () => {
    const error = new ValidationError("invalid input");
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.name).toBe("ValidationError");
  });

  it("stores field errors", () => {
    const fieldErrors = { email: "invalid email", name: "required" };
    const error = new ValidationError("validation failed", fieldErrors);
    expect(error.fieldErrors).toEqual(fieldErrors);
  });

  it("includes field errors in JSON serialization", () => {
    const fieldErrors = { email: "invalid" };
    const error = new ValidationError("fail", fieldErrors);
    const json = error.toJSON();
    expect(json.fieldErrors).toEqual(fieldErrors);
  });

  it("defaults fieldErrors to undefined when not provided", () => {
    const error = new ValidationError("fail");
    expect(error.fieldErrors).toBeUndefined();
  });
});

describe("NotFoundError", () => {
  it("creates a not found error with status 404", () => {
    const error = new NotFoundError("user not found");
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
    expect(error.name).toBe("NotFoundError");
  });

  it("stores resource type and id", () => {
    const error = new NotFoundError("not found", "User", "123");
    expect(error.resource).toBe("User");
    expect(error.resourceId).toBe("123");
  });

  it("includes resource info in JSON serialization", () => {
    const error = new NotFoundError("not found", "Note", "abc");
    const json = error.toJSON();
    expect(json.resource).toBe("Note");
    expect(json.resourceId).toBe("abc");
  });
});

describe("ConflictError", () => {
  it("creates a conflict error with status 409", () => {
    const error = new ConflictError("duplicate entry");
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe("CONFLICT");
    expect(error.name).toBe("ConflictError");
  });
});

describe("UnauthorizedError", () => {
  it("creates an unauthorized error with status 401", () => {
    const error = new UnauthorizedError("not authenticated");
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe("UNAUTHORIZED");
    expect(error.name).toBe("UnauthorizedError");
  });
});

describe("ForbiddenError", () => {
  it("creates a forbidden error with status 403", () => {
    const error = new ForbiddenError("access denied");
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe("FORBIDDEN");
    expect(error.name).toBe("ForbiddenError");
  });
});

describe("AuthError", () => {
  it("creates an auth error with status 401 by default", () => {
    const error = new AuthError("token expired");
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(AuthError);
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe("AUTH_ERROR");
    expect(error.name).toBe("AuthError");
  });

  it("supports custom auth error code", () => {
    const error = new AuthError("invalid token", "INVALID_TOKEN");
    expect(error.code).toBe("INVALID_TOKEN");
  });

  it("supports custom status code", () => {
    const error = new AuthError("forbidden", "AUTH_FORBIDDEN", 403);
    expect(error.statusCode).toBe(403);
  });
});

describe("normalizeError", () => {
  it("returns AppError instances as-is", () => {
    const original = new AppError("test");
    const result = normalizeError(original);
    expect(result).toBe(original);
  });

  it("returns subclasses of AppError as-is", () => {
    const original = new ValidationError("test");
    const result = normalizeError(original);
    expect(result).toBe(original);
  });

  it("wraps native Error into AppError", () => {
    const original = new Error("native error");
    const result = normalizeError(original);
    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe("native error");
    expect(result.statusCode).toBe(500);
    expect(result.code).toBe("INTERNAL_ERROR");
  });

  it("wraps string into AppError", () => {
    const result = normalizeError("string error");
    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe("string error");
    expect(result.statusCode).toBe(500);
  });

  it("wraps unknown value into AppError", () => {
    const result = normalizeError(42);
    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe("Unknown error");
    expect(result.statusCode).toBe(500);
  });

  it("wraps null into AppError", () => {
    const result = normalizeError(null);
    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe("Unknown error");
  });

  it("wraps undefined into AppError", () => {
    const result = normalizeError(undefined);
    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe("Unknown error");
  });
});
