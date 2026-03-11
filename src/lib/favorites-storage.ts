import type { FavoriteItem } from "@/types/favorite";

// WARNING: Module-level Map does not persist across serverless invocations (e.g. Vercel).
// State may not be shared between different API route handlers.
// This is a temporary solution — migrate to a database for production use.
export const favoritesMap = new Map<string, FavoriteItem>();
