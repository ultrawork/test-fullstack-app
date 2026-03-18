import { describe, it, expect, expectTypeOf } from "vitest";
import {
  type Brand,
  type UserId,
  type NoteId,
  AppRole,
  type JwtAccessTokenPayload,
  type JwtRefreshTokenPayload,
  DI_TOKENS,
  type Maybe,
  type JsonPrimitive,
  type JsonArray,
  type JsonObject,
  type JsonValue,
  createEntityId,
} from "./types";

// ─── Brand ───────────────────────────────────────────────────────────

describe("Brand", () => {
  it("branded types are structurally incompatible", () => {
    type A = Brand<string, "A">;
    type B = Brand<string, "B">;

    // compile-time check: A is not assignable to B
    expectTypeOf<A>().not.toEqualTypeOf<B>();
  });

  it("branded type extends its base type at type level", () => {
    type Branded = Brand<string, "Tag">;
    expectTypeOf<Branded>().toMatchTypeOf<string>();
  });
});

// ─── EntityId ────────────────────────────────────────────────────────

describe("EntityId / createEntityId", () => {
  it("createEntityId wraps a string into a branded id", () => {
    const id = createEntityId<UserId>("user-1");
    expect(id).toBe("user-1");
  });

  it("UserId and NoteId are distinct branded types", () => {
    expectTypeOf<UserId>().not.toEqualTypeOf<NoteId>();
  });

  it("EntityId is assignable to string", () => {
    const id = createEntityId<UserId>("u-1");
    const s: string = id;
    expect(s).toBe("u-1");
  });
});

// ─── AppRole ─────────────────────────────────────────────────────────

describe("AppRole", () => {
  it("has USER and ADMIN values", () => {
    expect(AppRole.USER).toBe("user");
    expect(AppRole.ADMIN).toBe("admin");
  });

  it("values are exhaustive (only USER and ADMIN)", () => {
    const values = Object.values(AppRole);
    expect(values).toHaveLength(2);
    expect(values).toContain("user");
    expect(values).toContain("admin");
  });
});

// ─── JWT Claims ──────────────────────────────────────────────────────

describe("JwtAccessTokenPayload", () => {
  it("has required fields with correct types", () => {
    const payload: JwtAccessTokenPayload = {
      sub: createEntityId<UserId>("u-1"),
      email: "user@example.com",
      role: AppRole.USER,
      iat: 1000,
      exp: 2000,
    };

    expect(payload.sub).toBe("u-1");
    expect(payload.email).toBe("user@example.com");
    expect(payload.role).toBe("user");
    expect(payload.iat).toBe(1000);
    expect(payload.exp).toBe(2000);
  });
});

describe("JwtRefreshTokenPayload", () => {
  it("has sub, jti, iat, exp fields", () => {
    const payload: JwtRefreshTokenPayload = {
      sub: createEntityId<UserId>("u-1"),
      jti: "token-id-123",
      iat: 1000,
      exp: 2000,
    };

    expect(payload.sub).toBe("u-1");
    expect(payload.jti).toBe("token-id-123");
    expect(payload.iat).toBe(1000);
    expect(payload.exp).toBe(2000);
  });
});

// ─── DI Tokens ───────────────────────────────────────────────────────

describe("DI_TOKENS", () => {
  it("has symbol tokens for core services", () => {
    expect(typeof DI_TOKENS.AuthService).toBe("symbol");
    expect(typeof DI_TOKENS.NoteService).toBe("symbol");
    expect(typeof DI_TOKENS.UserRepository).toBe("symbol");
    expect(typeof DI_TOKENS.NoteRepository).toBe("symbol");
    expect(typeof DI_TOKENS.Logger).toBe("symbol");
    expect(typeof DI_TOKENS.Config).toBe("symbol");
  });

  it("each token is unique", () => {
    const symbols = Object.values(DI_TOKENS);
    const unique = new Set(symbols);
    expect(unique.size).toBe(symbols.length);
  });

  it("token descriptions match key names", () => {
    expect(DI_TOKENS.AuthService.description).toBe("AuthService");
    expect(DI_TOKENS.NoteService.description).toBe("NoteService");
    expect(DI_TOKENS.UserRepository.description).toBe("UserRepository");
    expect(DI_TOKENS.NoteRepository.description).toBe("NoteRepository");
    expect(DI_TOKENS.Logger.description).toBe("Logger");
    expect(DI_TOKENS.Config.description).toBe("Config");
  });
});

// ─── Maybe ───────────────────────────────────────────────────────────

describe("Maybe", () => {
  it("accepts a value", () => {
    const val: Maybe<number> = 42;
    expect(val).toBe(42);
  });

  it("accepts null", () => {
    const val: Maybe<number> = null;
    expect(val).toBeNull();
  });

  it("accepts undefined", () => {
    const val: Maybe<number> = undefined;
    expect(val).toBeUndefined();
  });
});

// ─── Json types ──────────────────────────────────────────────────────

describe("Json types", () => {
  it("JsonPrimitive covers string, number, boolean, null", () => {
    const s: JsonPrimitive = "hello";
    const n: JsonPrimitive = 42;
    const b: JsonPrimitive = true;
    const nil: JsonPrimitive = null;

    expect(s).toBe("hello");
    expect(n).toBe(42);
    expect(b).toBe(true);
    expect(nil).toBeNull();
  });

  it("JsonObject holds key-value pairs of JsonValue", () => {
    const obj: JsonObject = {
      name: "test",
      count: 1,
      nested: { a: true },
      list: [1, 2, 3],
    };
    expect(obj["name"]).toBe("test");
  });

  it("JsonArray holds JsonValue items", () => {
    const arr: JsonArray = [1, "two", null, { key: "val" }, [true]];
    expect(arr).toHaveLength(5);
  });

  it("JsonValue is a union of primitive, object, and array", () => {
    const values: JsonValue[] = [
      "string",
      42,
      true,
      null,
      { key: "value" },
      [1, 2],
    ];
    expect(values).toHaveLength(6);
  });
});
