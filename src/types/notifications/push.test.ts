import { describe, it, expect, expectTypeOf } from "vitest";
import type {
  PushSubscriptionKeys,
  PushSubscriptionDTO,
  ApiError,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
} from "./push";

describe("PushSubscriptionKeys", () => {
  it("has p256dh and auth string fields", () => {
    const keys: PushSubscriptionKeys = {
      p256dh: "test-p256dh-key",
      auth: "test-auth-key",
    };

    expectTypeOf(keys.p256dh).toBeString();
    expectTypeOf(keys.auth).toBeString();
    expect(keys.p256dh).toBe("test-p256dh-key");
    expect(keys.auth).toBe("test-auth-key");
  });
});

describe("PushSubscriptionDTO", () => {
  it("has required endpoint and keys fields", () => {
    const dto: PushSubscriptionDTO = {
      endpoint: "https://push.example.com/send/abc",
      keys: {
        p256dh: "test-p256dh",
        auth: "test-auth",
      },
    };

    expectTypeOf(dto.endpoint).toBeString();
    expectTypeOf(dto.keys).toEqualTypeOf<PushSubscriptionKeys>();
    expect(dto.endpoint).toBe("https://push.example.com/send/abc");
  });

  it("supports optional expirationTime and userId", () => {
    const dto: PushSubscriptionDTO = {
      endpoint: "https://push.example.com/send/abc",
      keys: { p256dh: "p", auth: "a" },
      expirationTime: 1234567890,
      userId: "user-123",
    };

    expect(dto.expirationTime).toBe(1234567890);
    expect(dto.userId).toBe("user-123");
  });

  it("allows expirationTime and userId to be undefined", () => {
    const dto: PushSubscriptionDTO = {
      endpoint: "https://push.example.com/send/abc",
      keys: { p256dh: "p", auth: "a" },
    };

    expect(dto.expirationTime).toBeUndefined();
    expect(dto.userId).toBeUndefined();
  });

  it("allows expirationTime to be null", () => {
    const dto: PushSubscriptionDTO = {
      endpoint: "https://push.example.com/send/abc",
      keys: { p256dh: "p", auth: "a" },
      expirationTime: null,
    };

    expect(dto.expirationTime).toBeNull();
  });
});

describe("ApiError", () => {
  it("has required code and message fields", () => {
    const error: ApiError = {
      code: "VAPID_KEY_NOT_CONFIGURED",
      message: "VAPID key is not configured",
    };

    expectTypeOf(error.code).toBeString();
    expectTypeOf(error.message).toBeString();
    expect(error.code).toBe("VAPID_KEY_NOT_CONFIGURED");
  });

  it("supports optional details array", () => {
    const error: ApiError = {
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details: ["endpoint is required", "keys.p256dh is required"],
    };

    expect(error.details).toHaveLength(2);
    expect(error.details![0]).toBe("endpoint is required");
  });

  it("allows details to be undefined", () => {
    const error: ApiError = {
      code: "SOME_ERROR",
      message: "Something went wrong",
    };

    expect(error.details).toBeUndefined();
  });
});

describe("ApiSuccessResponse", () => {
  it("has ok: true and typed data", () => {
    const response: ApiSuccessResponse<{ vapidPublicKey: string }> = {
      ok: true,
      data: { vapidPublicKey: "test-key" },
    };

    expect(response.ok).toBe(true);
    expect(response.data.vapidPublicKey).toBe("test-key");
  });
});

describe("ApiErrorResponse", () => {
  it("has ok: false and error field", () => {
    const response: ApiErrorResponse = {
      ok: false,
      error: {
        code: "VAPID_KEY_NOT_CONFIGURED",
        message: "VAPID key is not configured",
      },
    };

    expect(response.ok).toBe(false);
    expect(response.error.code).toBe("VAPID_KEY_NOT_CONFIGURED");
  });
});

describe("ApiResponse union type", () => {
  it("can be narrowed via ok discriminant", () => {
    const success: ApiResponse<{ created: boolean }> = {
      ok: true,
      data: { created: true },
    };

    const failure: ApiResponse<{ created: boolean }> = {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: ["endpoint is required"],
      },
    };

    if (success.ok) {
      expect(success.data.created).toBe(true);
    }

    if (!failure.ok) {
      expect(failure.error.code).toBe("VALIDATION_ERROR");
    }
  });
});
