import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getApiConfig, API_V2_PREFIX } from "./config";

describe("API Config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("exports API_V2_PREFIX as /api/v2", () => {
    expect(API_V2_PREFIX).toBe("/api/v2");
  });

  it("returns default baseUrl when NEXT_PUBLIC_API_URL is not set", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    const config = getApiConfig();
    expect(config.baseUrl).toBe("");
  });

  it("returns baseUrl from NEXT_PUBLIC_API_URL env var", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    const config = getApiConfig();
    expect(config.baseUrl).toBe("https://api.example.com");
  });

  it("returns config with correct shape", () => {
    const config = getApiConfig();
    expect(config).toHaveProperty("baseUrl");
    expect(config).toHaveProperty("prefix");
    expect(config.prefix).toBe("/api/v2");
  });

  it("builds full API URL correctly", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    const config = getApiConfig();
    expect(`${config.baseUrl}${config.prefix}`).toBe(
      "https://api.example.com/api/v2",
    );
  });
});
