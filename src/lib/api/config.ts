/** API version 2 prefix */
export const API_V2_PREFIX = "/api/v2";

interface ApiConfig {
  /** Base URL for the API (e.g., https://api.example.com) */
  baseUrl: string;
  /** API path prefix (e.g., /api/v2) */
  prefix: string;
}

/** Returns the current API configuration based on environment variables */
export function getApiConfig(): ApiConfig {
  return {
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
    prefix: API_V2_PREFIX,
  };
}
