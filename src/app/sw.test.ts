/**
 * Tests for public/sw.js Service Worker logic.
 * We test the utility functions extracted from the SW in isolation.
 */
import { describe, it, expect } from "vitest";

// --- Helpers extracted from sw.js for testability ---

/** Build notification options from a push payload. */
function buildNotificationOptions(payload: Record<string, unknown> | null) {
  const isHighOrUrgent =
    payload?.priority === "HIGH" || payload?.priority === "URGENT";

  const requireInteraction =
    ((payload?.requireInteraction as boolean | undefined) ?? isHighOrUrgent) ||
    false;

  const tag = (payload?.tag as string | undefined) || undefined;

  const renotify = tag
    ? (((payload?.renotify as boolean | undefined) ?? isHighOrUrgent) || false)
    : false;

  const silent =
    ((payload?.silent as boolean | undefined) ??
      (payload?.priority === "LOW")) ||
    false;

  return {
    body: (payload?.body as string | undefined) || "",
    icon: payload?.icon as string | undefined,
    badge: payload?.badge as string | undefined,
    tag,
    data: {
      ...(payload?.data as Record<string, unknown> | undefined),
      url: (payload?.url as string | undefined) || (payload?.data as Record<string, unknown> | undefined)?.url || "/",
      _meta: {
        priority: (payload?.priority as string | undefined) || null,
        type: (payload?.type as string | undefined) || null,
      },
    },
    requireInteraction,
    renotify,
    silent,
    actions: Array.isArray(payload?.actions)
      ? (payload.actions as unknown[])
      : undefined,
  };
}

/** Safely parse push event data. */
function parsePushPayload(
  jsonText: string | null
): Record<string, unknown> | null {
  if (!jsonText) return null;
  try {
    return JSON.parse(jsonText) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Check whether a URL belongs to the same origin. */
function isSameOrigin(url: string, origin: string): boolean {
  try {
    return new URL(url, origin).origin === origin;
  } catch {
    return false;
  }
}

// --- Tests ---

describe("parsePushPayload", () => {
  it("returns null for null input", () => {
    expect(parsePushPayload(null)).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    expect(parsePushPayload("not-json")).toBeNull();
  });

  it("parses valid JSON", () => {
    expect(parsePushPayload('{"title":"Hello"}')).toEqual({ title: "Hello" });
  });

  it("returns null for empty string", () => {
    expect(parsePushPayload("")).toBeNull();
  });
});

describe("buildNotificationOptions — body", () => {
  it("uses empty string when body is absent", () => {
    const opts = buildNotificationOptions(null);
    expect(opts.body).toBe("");
  });

  it("uses payload body when present", () => {
    const opts = buildNotificationOptions({ body: "test body" });
    expect(opts.body).toBe("test body");
  });
});

describe("buildNotificationOptions — data.url", () => {
  it("defaults url to /", () => {
    const opts = buildNotificationOptions(null);
    expect(opts.data.url).toBe("/");
  });

  it("uses top-level url field", () => {
    const opts = buildNotificationOptions({ url: "/notes/1" });
    expect(opts.data.url).toBe("/notes/1");
  });

  it("falls back to data.url", () => {
    const opts = buildNotificationOptions({ data: { url: "/notes/2" } });
    expect(opts.data.url).toBe("/notes/2");
  });

  it("top-level url takes precedence over data.url", () => {
    const opts = buildNotificationOptions({ url: "/primary", data: { url: "/secondary" } });
    expect(opts.data.url).toBe("/primary");
  });
});

describe("buildNotificationOptions — priority mapping", () => {
  it("sets requireInteraction for HIGH priority", () => {
    const opts = buildNotificationOptions({ priority: "HIGH" });
    expect(opts.requireInteraction).toBe(true);
  });

  it("sets renotify for HIGH priority when tag is present", () => {
    const opts = buildNotificationOptions({ priority: "HIGH", tag: "high-msg" });
    expect(opts.renotify).toBe(true);
  });

  it("does not set renotify for HIGH priority without tag", () => {
    const opts = buildNotificationOptions({ priority: "HIGH" });
    expect(opts.renotify).toBe(false);
  });

  it("sets requireInteraction for URGENT priority", () => {
    const opts = buildNotificationOptions({ priority: "URGENT" });
    expect(opts.requireInteraction).toBe(true);
  });

  it("sets renotify for URGENT priority when tag is present", () => {
    const opts = buildNotificationOptions({ priority: "URGENT", tag: "urgent-msg" });
    expect(opts.renotify).toBe(true);
  });

  it("does not set renotify for URGENT priority without tag", () => {
    const opts = buildNotificationOptions({ priority: "URGENT" });
    expect(opts.renotify).toBe(false);
  });

  it("sets silent for LOW priority", () => {
    const opts = buildNotificationOptions({ priority: "LOW" });
    expect(opts.silent).toBe(true);
    expect(opts.requireInteraction).toBe(false);
  });

  it("leaves all flags false for NORMAL priority", () => {
    const opts = buildNotificationOptions({ priority: "NORMAL" });
    expect(opts.requireInteraction).toBe(false);
    expect(opts.renotify).toBe(false);
    expect(opts.silent).toBe(false);
  });

  it("allows payload to override silent even on LOW priority", () => {
    const opts = buildNotificationOptions({ priority: "LOW", silent: false });
    expect(opts.silent).toBe(false);
  });
});

describe("buildNotificationOptions — actions", () => {
  it("sets actions when array is provided", () => {
    const actions = [{ action: "open", title: "Open" }];
    const opts = buildNotificationOptions({ actions });
    expect(opts.actions).toEqual(actions);
  });

  it("sets actions to undefined when not an array", () => {
    const opts = buildNotificationOptions({ actions: "open" });
    expect(opts.actions).toBeUndefined();
  });
});

describe("isSameOrigin", () => {
  const origin = "https://example.com";

  it("returns true for same-origin URL", () => {
    expect(isSameOrigin("/notes", origin)).toBe(true);
  });

  it("returns true for full same-origin URL", () => {
    expect(isSameOrigin("https://example.com/notes", origin)).toBe(true);
  });

  it("returns false for cross-origin URL", () => {
    expect(isSameOrigin("https://other.com/page", origin)).toBe(false);
  });

  it("returns false for invalid absolute URL", () => {
    expect(isSameOrigin("https://[invalid]/", origin)).toBe(false);
  });
});
