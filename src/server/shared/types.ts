/**
 * Shared server types: branded types, entity IDs, roles,
 * JWT claims, DI tokens, utility types.
 */

// ─── Brand (opaque/nominal typing) ──────────────────────────────────

declare const __brand: unique symbol;

/** Branded type — creates nominal types from structural ones. */
export type Brand<T, B extends string> = T & { readonly [__brand]: B };

// ─── EntityId ────────────────────────────────────────────────────────

/** Generic branded string identifier for domain entities. */
export type EntityId<T extends string> = Brand<string, T>;

/** User entity identifier. */
export type UserId = EntityId<"UserId">;

/** Note entity identifier. */
export type NoteId = EntityId<"NoteId">;

/** Creates a branded entity id from a raw string. */
export function createEntityId<T extends EntityId<string>>(raw: string): T {
  return raw as T;
}

// ─── AppRole ─────────────────────────────────────────────────────────

/** Application user roles. */
export const AppRole = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type AppRole = (typeof AppRole)[keyof typeof AppRole];

// ─── JWT Claims ──────────────────────────────────────────────────────

/** Access token JWT payload. */
export interface JwtAccessTokenPayload {
  readonly sub: UserId;
  readonly email: string;
  readonly role: AppRole;
  readonly iat: number;
  readonly exp: number;
}

/** Refresh token JWT payload (opaque token stored in DB). */
export interface JwtRefreshTokenPayload {
  readonly sub: UserId;
  readonly jti: string;
  readonly iat: number;
  readonly exp: number;
}

// ─── DI Tokens ───────────────────────────────────────────────────────

/** Dependency injection tokens for service container. */
export const DI_TOKENS = {
  AuthService: Symbol("AuthService"),
  NoteService: Symbol("NoteService"),
  UserRepository: Symbol("UserRepository"),
  NoteRepository: Symbol("NoteRepository"),
  Logger: Symbol("Logger"),
  Config: Symbol("Config"),
} as const;

// ─── Maybe ───────────────────────────────────────────────────────────

/** Value that may be absent (null or undefined). */
export type Maybe<T> = T | null | undefined;

// ─── Json types ──────────────────────────────────────────────────────

/** JSON primitive value. */
export type JsonPrimitive = string | number | boolean | null;

/** JSON object — record of string keys to JSON values. */
export type JsonObject = { [key: string]: JsonValue };

/** JSON array. */
export type JsonArray = JsonValue[];

/** Any valid JSON value. */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
