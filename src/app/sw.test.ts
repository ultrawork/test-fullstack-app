import { describe, expect, it } from "vitest";

import {
  buildNotificationOptions,
  isSameOrigin,
  normalizeUrlForMatch,
  parsePushPayload,
  resolveNotificationTargetUrl,
} from "@/lib/sw-helpers";

describe("parsePushPayload", () => {
  it("returns null for null input", () => {
    expect(parsePushPayload(null)).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    expect(parsePushPayload("not-json")).toBeNull();
  });

  it("parses valid JSON object", () => {
    expect(parsePushPayload('{"title":"Hello"}')).toEqual({ title: "Hello" });
  });

  it("returns null for empty string", () => {
    expect(parsePushPayload("")).toBeNull();
  });

  it.each(['"text"', "123", "true", "[]"])(
    "returns null for non-object JSON payload %s",
    (input) => {
      expect(parsePushPayload(input)).toBeNull();
    },
  );
});

describe("buildNotificationOptions — body", () => {
  it("uses empty string when body is absent", () => {
    const options = buildNotificationOptions(null);
    expect(options.body).toBe("");
  });

  it("uses payload body when present", () => {
    const options = buildNotificationOptions({ body: "test body" });
    expect(options.body).toBe("test body");
  });
});

describe("buildNotificationOptions — data.url", () => {
  it("defaults url to /", () => {
    const options = buildNotificationOptions(null);
    expect(options.data.url).toBe("/");
  });

  it("uses top-level url field", () => {
    const options = buildNotificationOptions({ url: "/notes/1" });
    expect(options.data.url).toBe("/notes/1");
  });

  it("falls back to data.url", () => {
    const options = buildNotificationOptions({ data: { url: "/notes/2" } });
    expect(options.data.url).toBe("/notes/2");
  });

  it("top-level url takes precedence over data.url", () => {
    const options = buildNotificationOptions({
      url: "/primary",
      data: { url: "/secondary" },
    });
    expect(options.data.url).toBe("/primary");
  });

  it("ignores non-object payload.data", () => {
    const options = buildNotificationOptions({
      data: "bad-data" as never,
    });
    expect(options.data).toEqual({
      url: "/",
      _meta: {
        priority: null,
        type: null,
      },
    });
  });
});

describe("buildNotificationOptions — priority mapping", () => {
  it("sets requireInteraction for HIGH priority", () => {
    const options = buildNotificationOptions({ priority: "HIGH" });
    expect(options.requireInteraction).toBe(true);
  });

  it("sets renotify for HIGH priority when tag is present", () => {
    const options = buildNotificationOptions({
      priority: "HIGH",
      tag: "high-msg",
    });
    expect(options.renotify).toBe(true);
  });

  it("does not set renotify for HIGH priority without tag", () => {
    const options = buildNotificationOptions({ priority: "HIGH" });
    expect(options.renotify).toBe(false);
  });

  it("sets requireInteraction for URGENT priority", () => {
    const options = buildNotificationOptions({ priority: "URGENT" });
    expect(options.requireInteraction).toBe(true);
  });

  it("sets renotify for URGENT priority when tag is present", () => {
    const options = buildNotificationOptions({
      priority: "URGENT",
      tag: "urgent-msg",
    });
    expect(options.renotify).toBe(true);
  });

  it("does not set renotify for URGENT priority without tag", () => {
    const options = buildNotificationOptions({ priority: "URGENT" });
    expect(options.renotify).toBe(false);
  });

  it("sets silent for LOW priority", () => {
    const options = buildNotificationOptions({ priority: "LOW" });
    expect(options.silent).toBe(true);
    expect(options.requireInteraction).toBe(false);
  });

  it("leaves all flags false for NORMAL priority", () => {
    const options = buildNotificationOptions({ priority: "NORMAL" });
    expect(options.requireInteraction).toBe(false);
    expect(options.renotify).toBe(false);
    expect(options.silent).toBe(false);
  });

  it("allows payload to override silent even on LOW priority", () => {
    const options = buildNotificationOptions({
      priority: "LOW",
      silent: false,
    });
    expect(options.silent).toBe(false);
  });
});

describe("buildNotificationOptions — actions", () => {
  it("sets actions when valid array is provided", () => {
    const actions = [{ action: "open", title: "Open" }];
    const options = buildNotificationOptions({ actions });
    expect(options.actions).toEqual(actions);
    expect(options.data.actions).toEqual(actions);
  });

  it("drops invalid action entries", () => {
    const options = buildNotificationOptions({
      actions: [{ action: "open" }, { action: "dismiss", title: "Dismiss" }],
    });
    expect(options.actions).toEqual([{ action: "dismiss", title: "Dismiss" }]);
  });

  it("sets actions to undefined when not an array", () => {
    const options = buildNotificationOptions({ actions: "open" });
    expect(options.actions).toBeUndefined();
  });

  it("preserves valid actionUrls map", () => {
    const options = buildNotificationOptions({
      actionUrls: { open: "/notes/1", dismiss: "/inbox" },
    });
    expect(options.data.actionUrls).toEqual({
      open: "/notes/1",
      dismiss: "/inbox",
    });
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

describe("normalizeUrlForMatch", () => {
  const origin = "https://example.com";

  it("normalizes relative and absolute same-origin URLs to same match key", () => {
    expect(normalizeUrlForMatch("/notes/1", origin)).toEqual({
      origin,
      pathname: "/notes/1",
    });

    expect(normalizeUrlForMatch("https://example.com/notes/1/", origin)).toEqual({
      origin,
      pathname: "/notes/1",
    });
  });

  it("ignores query and hash when matching", () => {
    expect(
      normalizeUrlForMatch("https://example.com/notes/1?tab=a#section", origin),
    ).toEqual({
      origin,
      pathname: "/notes/1",
    });
  });

  it("returns null for cross-origin URL", () => {
    expect(normalizeUrlForMatch("https://other.com/notes/1", origin)).toBeNull();
  });
});

describe("resolveNotificationTargetUrl", () => {
  const origin = "https://example.com";

  it("returns same-origin relative path", () => {
    expect(resolveNotificationTargetUrl("/notes/1?tab=a#details", origin)).toBe(
      "/notes/1?tab=a#details",
    );
  });

  it("converts same-origin absolute url to app-relative path", () => {
    expect(
      resolveNotificationTargetUrl(
        "https://example.com/notes/1?tab=a#details",
        origin,
      ),
    ).toBe("/notes/1?tab=a#details");
  });

  it("falls back to / for cross-origin url", () => {
    expect(resolveNotificationTargetUrl("https://other.com/phishing", origin)).toBe(
      "/",
    );
  });

  it("falls back to / for invalid url", () => {
    expect(resolveNotificationTargetUrl("https://[invalid]/", origin)).toBe("/");
  });
});
