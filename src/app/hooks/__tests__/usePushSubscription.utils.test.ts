import { describe, it, expect } from "vitest";
import {
  urlBase64ToUint8Array,
  toServerPayload,
  DEFAULT_CONFIG,
} from "../usePushSubscription.types";
import type {
  PushPermissionState,
  PushSubscriptionConfig,
  ServerPayload,
  PushSubscriptionState,
  PushSubscriptionActions,
  UsePushSubscriptionReturn,
} from "../usePushSubscription.types";

describe("urlBase64ToUint8Array", () => {
  it("converts a base64url string to Uint8Array", () => {
    // "Hello" in base64url is "SGVsbG8"
    const result = urlBase64ToUint8Array("SGVsbG8");
    expect(result).toBeInstanceOf(Uint8Array);
    expect(Array.from(result)).toEqual([72, 101, 108, 108, 111]);
  });

  it("handles base64url characters (- and _) replacing them with + and /", () => {
    // base64url "-_8" → base64 "+/8=" → bytes [0xfb, 0xff]
    const result = urlBase64ToUint8Array("-_8");
    expect(result).toBeInstanceOf(Uint8Array);
    expect(Array.from(result)).toEqual([0xfb, 0xff]);
  });

  it("adds correct padding for length % 4 == 2", () => {
    // "YQ" -> needs "==" padding -> decodes to "a"
    const result = urlBase64ToUint8Array("YQ");
    expect(Array.from(result)).toEqual([97]);
  });

  it("adds correct padding for length % 4 == 3", () => {
    // "YWI" -> needs "=" padding -> decodes to "ab"
    const result = urlBase64ToUint8Array("YWI");
    expect(Array.from(result)).toEqual([97, 98]);
  });

  it("handles strings that need no padding (length % 4 == 0)", () => {
    // "YWJj" -> no padding needed -> decodes to "abc"
    const result = urlBase64ToUint8Array("YWJj");
    expect(Array.from(result)).toEqual([97, 98, 99]);
  });

  it("returns empty Uint8Array for empty string", () => {
    const result = urlBase64ToUint8Array("");
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(0);
  });

  it("handles a typical VAPID public key (65 bytes)", () => {
    const vapidKey =
      "BNbxGYNMhEIi9gHQv5N5bMhcMnKGGrGFswd3JM1AUxl4PdlYwnfOKcGnOYHceaJeMzgj7b69_V69L0rKO1Aj5Rs";
    const result = urlBase64ToUint8Array(vapidKey);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(65);
  });
});

describe("toServerPayload", () => {
  it("converts a PushSubscription to ServerPayload format", () => {
    const mockSubscription = {
      endpoint: "https://push.example.com/subscription/123",
      toJSON: () => ({
        endpoint: "https://push.example.com/subscription/123",
        keys: {
          p256dh: "test-p256dh-key",
          auth: "test-auth-key",
        },
      }),
    } as unknown as PushSubscription;

    const result = toServerPayload(mockSubscription);

    expect(result).toEqual({
      endpoint: "https://push.example.com/subscription/123",
      keys: {
        p256dh: "test-p256dh-key",
        auth: "test-auth-key",
      },
    });
  });

  it("uses empty strings when keys are undefined", () => {
    const mockSubscription = {
      endpoint: "https://push.example.com/subscription/456",
      toJSON: () => ({
        endpoint: "https://push.example.com/subscription/456",
      }),
    } as unknown as PushSubscription;

    const result = toServerPayload(mockSubscription);

    expect(result).toEqual({
      endpoint: "https://push.example.com/subscription/456",
      keys: {
        p256dh: "",
        auth: "",
      },
    });
  });

  it("returns object matching ServerPayload interface", () => {
    const mockSubscription = {
      endpoint: "https://push.example.com/sub/789",
      toJSON: () => ({
        endpoint: "https://push.example.com/sub/789",
        keys: {
          p256dh: "key-p256dh",
          auth: "key-auth",
        },
      }),
    } as unknown as PushSubscription;

    const result: ServerPayload = toServerPayload(mockSubscription);
    expect(result.endpoint).toBe("https://push.example.com/sub/789");
    expect(result.keys.p256dh).toBe("key-p256dh");
    expect(result.keys.auth).toBe("key-auth");
  });
});

describe("DEFAULT_CONFIG", () => {
  it("has correct default subscribe URL", () => {
    expect(DEFAULT_CONFIG.subscribeUrl).toBe(
      "/api/v1/notifications/subscribe",
    );
  });

  it("has correct default unsubscribe URL", () => {
    expect(DEFAULT_CONFIG.unsubscribeUrl).toBe(
      "/api/v1/notifications/subscribe",
    );
  });

  it("has empty VAPID public key by default", () => {
    expect(DEFAULT_CONFIG.vapidPublicKey).toBe("");
  });

  it("has autoSubscribe disabled by default", () => {
    expect(DEFAULT_CONFIG.autoSubscribe).toBe(false);
  });

  it("satisfies PushSubscriptionConfig interface", () => {
    const config: PushSubscriptionConfig = DEFAULT_CONFIG;
    expect(config).toBeDefined();
    expect(typeof config.subscribeUrl).toBe("string");
    expect(typeof config.unsubscribeUrl).toBe("string");
    expect(typeof config.vapidPublicKey).toBe("string");
    expect(typeof config.autoSubscribe).toBe("boolean");
  });
});

describe("Type exports", () => {
  it("PushPermissionState accepts valid values", () => {
    const states: PushPermissionState[] = [
      "prompt",
      "granted",
      "denied",
      "unsupported",
    ];
    expect(states).toHaveLength(4);
  });

  it("PushSubscriptionState has required shape", () => {
    const state: PushSubscriptionState = {
      isSupported: true,
      permissionState: "prompt",
      isSubscribed: false,
      isLoading: false,
      error: null,
    };
    expect(state.isSupported).toBe(true);
    expect(state.permissionState).toBe("prompt");
    expect(state.isSubscribed).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("PushSubscriptionActions has required methods", () => {
    const actions: PushSubscriptionActions = {
      subscribe: async () => {},
      unsubscribe: async () => {},
    };
    expect(typeof actions.subscribe).toBe("function");
    expect(typeof actions.unsubscribe).toBe("function");
  });

  it("UsePushSubscriptionReturn combines state and actions", () => {
    const hookReturn: UsePushSubscriptionReturn = {
      isSupported: false,
      permissionState: "unsupported",
      isSubscribed: false,
      isLoading: false,
      error: null,
      subscribe: async () => {},
      unsubscribe: async () => {},
    };
    expect(hookReturn.isSupported).toBe(false);
    expect(typeof hookReturn.subscribe).toBe("function");
  });
});
