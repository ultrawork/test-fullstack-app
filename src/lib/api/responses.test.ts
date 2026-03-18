import { describe, it, expect } from "vitest";
import { ok, badRequest, internalError, safeJson } from "./responses";

describe("ok", () => {
  it("returns NextResponse with ok: true and data", () => {
    const response = ok({ vapidPublicKey: "test123" });
    expect(response.status).toBe(200);
  });

  it("includes correct JSON body", async () => {
    const response = ok({ created: true });
    const body = await response.json();
    expect(body).toEqual({ ok: true, data: { created: true } });
  });

  it("allows custom status code", async () => {
    const response = ok({ id: 1 }, 201);
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toEqual({ ok: true, data: { id: 1 } });
  });
});

describe("badRequest", () => {
  it("returns 400 status", () => {
    const response = badRequest("Invalid input");
    expect(response.status).toBe(400);
  });

  it("includes error message in body", async () => {
    const response = badRequest("Invalid input");
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.message).toBe("Invalid input");
  });

  it("includes details array when provided", async () => {
    const details = ["endpoint is required", "keys.auth is invalid"];
    const response = badRequest("Validation failed", details);
    const body = await response.json();
    expect(body.error.details).toEqual(details);
  });

  it("includes error code when provided", async () => {
    const response = badRequest("Invalid", undefined, "INVALID_INPUT");
    const body = await response.json();
    expect(body.error.code).toBe("INVALID_INPUT");
  });
});

describe("internalError", () => {
  it("returns 500 status", () => {
    const response = internalError("Server error", "INTERNAL_ERROR");
    expect(response.status).toBe(500);
  });

  it("includes error code and message", async () => {
    const response = internalError("Key not found", "VAPID_KEY_NOT_CONFIGURED");
    const body = await response.json();
    expect(body).toEqual({
      ok: false,
      error: {
        code: "VAPID_KEY_NOT_CONFIGURED",
        message: "Key not found",
      },
    });
  });
});

describe("safeJson", () => {
  it("parses valid JSON from Request", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ endpoint: "https://example.com" }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await safeJson(request);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ endpoint: "https://example.com" });
    }
  });

  it("returns error for invalid JSON", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: "not json{",
      headers: { "Content-Type": "application/json" },
    });
    const result = await safeJson(request);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it("returns error for empty body", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
    });
    const result = await safeJson(request);
    expect(result.success).toBe(false);
  });
});
