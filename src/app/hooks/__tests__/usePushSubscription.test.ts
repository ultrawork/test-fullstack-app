import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  usePushSubscription,
  urlBase64ToUint8Array,
  toServerPayload,
  DEFAULT_CONFIG,
  getHeadersResolved,
  fetchVapidPublicKey,
  postSubscribe,
  postUnsubscribe,
  type PushSubscriptionConfig,
} from '../usePushSubscription';

/* ------------------------------------------------------------------ */
/*  Mock factories                                                     */
/* ------------------------------------------------------------------ */

function createMockPushSubscription(
  overrides: Partial<PushSubscription> = {},
): PushSubscription {
  return {
    endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
    expirationTime: null,
    options: {
      applicationServerKey: new ArrayBuffer(0),
      userVisibleOnly: true,
    },
    getKey: vi.fn(() => new ArrayBuffer(0)),
    toJSON: vi.fn(() => ({
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
      keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
    })),
    unsubscribe: vi.fn(async () => true),
    ...overrides,
  } as unknown as PushSubscription;
}

function createMockPushManager(
  subscription: PushSubscription | null = null,
): PushManager {
  return {
    getSubscription: vi.fn(async () => subscription),
    subscribe: vi.fn(async () => subscription ?? createMockPushSubscription()),
    permissionState: vi.fn(async () => 'granted' as PermissionState),
  } as unknown as PushManager;
}

function createMockServiceWorkerRegistration(
  pushManager?: PushManager,
): ServiceWorkerRegistration {
  return {
    pushManager: pushManager ?? createMockPushManager(),
    active: {} as ServiceWorker,
    installing: null,
    waiting: null,
    scope: '/',
    updateViaCache: 'none' as ServiceWorkerUpdateViaCache,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
    getNotifications: vi.fn(async () => []),
    showNotification: vi.fn(async () => undefined),
    unregister: vi.fn(async () => true),
    update: vi.fn(async () => undefined as unknown as ServiceWorkerRegistration),
    navigationPreload: {
      disable: vi.fn(),
      enable: vi.fn(),
      getState: vi.fn(),
      setHeaderValue: vi.fn(),
    } as unknown as NavigationPreloadManager,
    onupdatefound: null,
  } as unknown as ServiceWorkerRegistration;
}

/* ------------------------------------------------------------------ */
/*  Setup / Teardown                                                   */
/* ------------------------------------------------------------------ */

let mockRegistration: ServiceWorkerRegistration;
let mockPushManager: PushManager;
let mockSubscription: PushSubscription;

beforeEach(() => {
  mockSubscription = createMockPushSubscription();
  mockPushManager = createMockPushManager(null);
  mockRegistration = createMockServiceWorkerRegistration(mockPushManager);

  // ServiceWorker API
  Object.defineProperty(navigator, 'serviceWorker', {
    value: {
      register: vi.fn(async () => mockRegistration),
      ready: Promise.resolve(mockRegistration),
      controller: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
    writable: true,
    configurable: true,
  });

  // PushManager
  Object.defineProperty(window, 'PushManager', {
    value: vi.fn(),
    writable: true,
    configurable: true,
  });

  // Notification
  Object.defineProperty(window, 'Notification', {
    value: Object.assign(vi.fn(), {
      permission: 'default' as NotificationPermission,
      requestPermission: vi.fn(async () => 'granted' as NotificationPermission),
    }),
    writable: true,
    configurable: true,
  });

  // Global fetch mock
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ publicKey: 'test-vapid-key' }),
    })),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/* ------------------------------------------------------------------ */
/*  Pure utility tests                                                 */
/* ------------------------------------------------------------------ */

describe('urlBase64ToUint8Array', () => {
  it('converts a base64url string to Uint8Array', () => {
    // "SGVsbG8" is base64url for "Hello"
    const result = urlBase64ToUint8Array('SGVsbG8');
    expect(result).toBeInstanceOf(Uint8Array);
    expect(String.fromCharCode(...result)).toBe('Hello');
  });

  it('handles padding correctly', () => {
    // "YQ" is base64url for "a" (needs 2 padding chars)
    const result = urlBase64ToUint8Array('YQ');
    expect(String.fromCharCode(...result)).toBe('a');
  });

  it('replaces URL-safe characters', () => {
    // '-' → '+', '_' → '/'
    const result = urlBase64ToUint8Array('A-B_');
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('toServerPayload', () => {
  it('calls toJSON on the subscription', () => {
    const sub = createMockPushSubscription();
    const payload = toServerPayload(sub);
    expect(sub.toJSON).toHaveBeenCalled();
    expect(payload).toEqual({
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
      keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
    });
  });
});

describe('DEFAULT_CONFIG', () => {
  it('has correct default values', () => {
    expect(DEFAULT_CONFIG.serviceWorkerPath).toBe('/sw.js');
    expect(DEFAULT_CONFIG.vapidPublicKeyUrl).toBe('/api/push/vapid-public-key');
    expect(DEFAULT_CONFIG.subscribeUrl).toBe('/api/push/subscribe');
    expect(DEFAULT_CONFIG.unsubscribeUrl).toBe('/api/push/unsubscribe');
    expect(DEFAULT_CONFIG.headers).toEqual({
      'Content-Type': 'application/json',
    });
  });
});

/* ------------------------------------------------------------------ */
/*  Server helper tests                                                */
/* ------------------------------------------------------------------ */

describe('getHeadersResolved', () => {
  it('returns static headers as-is', async () => {
    const headers = { Authorization: 'Bearer token' };
    const result = await getHeadersResolved(headers);
    expect(result).toEqual(headers);
  });

  it('calls a sync function and returns result', async () => {
    const headersFn = () => ({ Authorization: 'Bearer sync-token' });
    const result = await getHeadersResolved(headersFn);
    expect(result).toEqual({ Authorization: 'Bearer sync-token' });
  });

  it('calls an async function and returns result', async () => {
    const headersFn = async () => ({ Authorization: 'Bearer async-token' });
    const result = await getHeadersResolved(headersFn);
    expect(result).toEqual({ Authorization: 'Bearer async-token' });
  });
});

describe('fetchVapidPublicKey', () => {
  it('fetches and returns the public key', async () => {
    const key = await fetchVapidPublicKey(
      '/api/push/vapid-public-key',
      { 'Content-Type': 'application/json' },
    );
    expect(key).toBe('test-vapid-key');
    expect(fetch).toHaveBeenCalledWith('/api/push/vapid-public-key', {
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('throws on non-OK response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    await expect(
      fetchVapidPublicKey('/api/push/vapid-public-key', {}),
    ).rejects.toThrow('Failed to fetch VAPID public key: 500');
  });

  it('throws on invalid response shape', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ wrong: 'shape' }),
    } as Response);

    await expect(
      fetchVapidPublicKey('/api/push/vapid-public-key', {}),
    ).rejects.toThrow('Invalid VAPID public key response');
  });
});

describe('postSubscribe', () => {
  it('posts subscription payload to server', async () => {
    const payload: PushSubscriptionJSON = {
      endpoint: 'https://example.com/push',
      keys: { p256dh: 'key1', auth: 'key2' },
    };

    await postSubscribe('/api/push/subscribe', {}, payload);

    expect(fetch).toHaveBeenCalledWith('/api/push/subscribe', {
      method: 'POST',
      headers: {},
      body: JSON.stringify(payload),
    });
  });

  it('throws on non-OK response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
    } as Response);

    await expect(
      postSubscribe('/api/push/subscribe', {}, {}),
    ).rejects.toThrow('Failed to subscribe on server: 400');
  });
});

describe('postUnsubscribe', () => {
  it('posts unsubscribe payload to server', async () => {
    const payload: PushSubscriptionJSON = {
      endpoint: 'https://example.com/push',
    };

    await postUnsubscribe('/api/push/unsubscribe', {}, payload);

    expect(fetch).toHaveBeenCalledWith('/api/push/unsubscribe', {
      method: 'POST',
      headers: {},
      body: JSON.stringify(payload),
    });
  });

  it('throws on non-OK response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    await expect(
      postUnsubscribe('/api/push/unsubscribe', {}, {}),
    ).rejects.toThrow('Failed to unsubscribe on server: 500');
  });
});

/* ------------------------------------------------------------------ */
/*  Hook tests                                                         */
/* ------------------------------------------------------------------ */

describe('usePushSubscription', () => {
  describe('initial state', () => {
    it('returns correct initial state when APIs are supported', async () => {
      const { result } = renderHook(() => usePushSubscription());

      // Initial synchronous state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isSupported).toBe(true);
      expect(result.current.isSubscribed).toBe(false);
      expect(result.current.subscription).toBeNull();
    });

    it('detects unsupported environment', async () => {
      // Remove PushManager entirely so 'PushManager' in window === false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).PushManager;

      const { result } = renderHook(() => usePushSubscription());

      await waitFor(() => {
        expect(result.current.isSupported).toBe(false);
      });
      expect(result.current.isSubscribed).toBe(false);
      expect(result.current.subscription).toBeNull();
    });

    it('detects existing subscription on mount', async () => {
      vi.mocked(mockPushManager.getSubscription).mockResolvedValue(
        mockSubscription,
      );

      const { result } = renderHook(() => usePushSubscription());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isSubscribed).toBe(true);
      expect(result.current.subscription).toBe(mockSubscription);
    });
  });

  describe('subscribe action', () => {
    it('performs full subscribe flow', async () => {
      vi.mocked(mockPushManager.subscribe).mockResolvedValue(mockSubscription);

      const onSubscribe = vi.fn();
      const { result } = renderHook(() =>
        usePushSubscription({ onSubscribe }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.subscribe();
      });

      // Verify SW registration
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
      // Verify permission request
      expect(Notification.requestPermission).toHaveBeenCalled();
      // Verify VAPID key fetch
      expect(fetch).toHaveBeenCalledWith(
        '/api/push/vapid-public-key',
        expect.objectContaining({ headers: expect.any(Object) }),
      );
      // Verify push subscription
      expect(mockPushManager.subscribe).toHaveBeenCalledWith({
        userVisibleOnly: true,
        applicationServerKey: expect.any(ArrayBuffer),
      });
      // Verify server notification
      expect(fetch).toHaveBeenCalledWith(
        '/api/push/subscribe',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        }),
      );
      // State updates
      expect(result.current.isSubscribed).toBe(true);
      expect(result.current.subscription).toBe(mockSubscription);
      expect(result.current.permission).toBe('granted');
      expect(result.current.error).toBeNull();
      // Callback
      expect(onSubscribe).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: expect.any(String),
        }),
      );
    });

    it('handles permission denied', async () => {
      vi.mocked(Notification.requestPermission).mockResolvedValue('denied');

      const onError = vi.fn();
      const { result } = renderHook(() =>
        usePushSubscription({ onError }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.subscribe();
      });

      expect(result.current.isSubscribed).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toContain('denied');
      expect(onError).toHaveBeenCalled();
    });

    it('handles fetch VAPID key failure', async () => {
      vi.mocked(Notification.requestPermission).mockResolvedValue('granted');
      vi.mocked(fetch).mockReset();
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({}),
      } as Response);

      const onError = vi.fn();
      const { result } = renderHook(() =>
        usePushSubscription({ onError }),
      );

      // Wait for initial refresh to settle (it will also fail)
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Reset error for subscribe action
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({}),
      } as Response);

      await act(async () => {
        await result.current.subscribe();
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(onError).toHaveBeenCalled();
    });

    it('handles SW registration failure', async () => {
      vi.mocked(navigator.serviceWorker.register).mockRejectedValue(
        new Error('SW registration failed'),
      );

      const onError = vi.fn();
      const { result } = renderHook(() =>
        usePushSubscription({ onError }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.subscribe();
      });

      expect(result.current.error?.message).toBe('SW registration failed');
      expect(result.current.isLoading).toBe(false);
      expect(onError).toHaveBeenCalled();
    });

    it('uses custom config URLs', async () => {
      vi.mocked(mockPushManager.subscribe).mockResolvedValue(mockSubscription);
      vi.mocked(Notification.requestPermission).mockResolvedValue('granted');

      const customConfig: Partial<PushSubscriptionConfig> = {
        serviceWorkerPath: '/custom-sw.js',
        vapidPublicKeyUrl: '/custom/vapid',
        subscribeUrl: '/custom/subscribe',
      };

      const { result } = renderHook(() =>
        usePushSubscription(customConfig),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.subscribe();
      });

      expect(navigator.serviceWorker.register).toHaveBeenCalledWith(
        '/custom-sw.js',
      );
      expect(fetch).toHaveBeenCalledWith(
        '/custom/vapid',
        expect.any(Object),
      );
      expect(fetch).toHaveBeenCalledWith(
        '/custom/subscribe',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  describe('unsubscribe action', () => {
    it('performs full unsubscribe flow', async () => {
      // Start with an existing subscription
      vi.mocked(mockPushManager.getSubscription).mockResolvedValue(
        mockSubscription,
      );

      const onUnsubscribe = vi.fn();
      const { result } = renderHook(() =>
        usePushSubscription({ onUnsubscribe }),
      );

      await waitFor(() => {
        expect(result.current.isSubscribed).toBe(true);
      });

      await act(async () => {
        await result.current.unsubscribe();
      });

      // Verify server notification
      expect(fetch).toHaveBeenCalledWith(
        '/api/push/unsubscribe',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        }),
      );
      // Verify local unsubscribe
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      // State updates
      expect(result.current.isSubscribed).toBe(false);
      expect(result.current.subscription).toBeNull();
      expect(result.current.error).toBeNull();
      // Callback
      expect(onUnsubscribe).toHaveBeenCalled();
    });

    it('handles no existing subscription gracefully', async () => {
      vi.mocked(mockPushManager.getSubscription).mockResolvedValue(null);

      const onUnsubscribe = vi.fn();
      const { result } = renderHook(() =>
        usePushSubscription({ onUnsubscribe }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.unsubscribe();
      });

      expect(result.current.isSubscribed).toBe(false);
      expect(result.current.error).toBeNull();
      expect(onUnsubscribe).toHaveBeenCalled();
    });

    it('handles server unsubscribe failure', async () => {
      vi.mocked(mockPushManager.getSubscription).mockResolvedValue(
        mockSubscription,
      );

      // First call succeeds (initial refresh), subsequent calls fail
      const fetchMock = vi.mocked(fetch);
      const originalImpl = fetchMock.getMockImplementation();
      fetchMock.mockImplementation(async (...args) => {
        // Fail on POST to unsubscribe URL
        if (
          args[1] &&
          typeof args[1] === 'object' &&
          'method' in args[1] &&
          args[1].method === 'POST'
        ) {
          return { ok: false, status: 500 } as Response;
        }
        if (originalImpl) return originalImpl(...args);
        return { ok: true, json: async () => ({ publicKey: 'test' }) } as Response;
      });

      const onError = vi.fn();
      const { result } = renderHook(() =>
        usePushSubscription({ onError }),
      );

      await waitFor(() => {
        expect(result.current.isSubscribed).toBe(true);
      });

      await act(async () => {
        await result.current.unsubscribe();
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('refresh action', () => {
    it('updates state from current subscription status', async () => {
      vi.mocked(mockPushManager.getSubscription).mockResolvedValue(null);

      const { result } = renderHook(() => usePushSubscription());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isSubscribed).toBe(false);

      // Simulate subscription appearing externally
      vi.mocked(mockPushManager.getSubscription).mockResolvedValue(
        mockSubscription,
      );

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.isSubscribed).toBe(true);
      expect(result.current.subscription).toBe(mockSubscription);
    });

    it('handles refresh errors', async () => {
      vi.mocked(mockPushManager.getSubscription).mockResolvedValue(null);

      const onError = vi.fn();
      const { result } = renderHook(() =>
        usePushSubscription({ onError }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Make getSubscription throw on next call
      vi.mocked(mockPushManager.getSubscription).mockRejectedValueOnce(
        new Error('PushManager error'),
      );

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.error?.message).toBe('PushManager error');
      expect(result.current.isLoading).toBe(false);
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('converts non-Error throws to Error objects', async () => {
      vi.mocked(navigator.serviceWorker.register).mockRejectedValue(
        'string error',
      );

      const { result } = renderHook(() => usePushSubscription());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.subscribe();
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('string error');
    });

    it('clears error on new action', async () => {
      // Cause an error first
      vi.mocked(navigator.serviceWorker.register).mockRejectedValueOnce(
        new Error('temp error'),
      );

      const { result } = renderHook(() => usePushSubscription());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.subscribe();
      });

      expect(result.current.error).not.toBeNull();

      // Restore normal behavior
      vi.mocked(navigator.serviceWorker.register).mockResolvedValue(
        mockRegistration,
      );
      vi.mocked(mockPushManager.subscribe).mockResolvedValue(mockSubscription);
      vi.mocked(Notification.requestPermission).mockResolvedValue('granted');

      await act(async () => {
        await result.current.subscribe();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('headers resolution', () => {
    it('works with async header function', async () => {
      vi.mocked(mockPushManager.subscribe).mockResolvedValue(mockSubscription);
      vi.mocked(Notification.requestPermission).mockResolvedValue('granted');

      const asyncHeaders = vi.fn(async () => ({
        Authorization: 'Bearer dynamic-token',
        'Content-Type': 'application/json',
      }));

      const { result } = renderHook(() =>
        usePushSubscription({ headers: asyncHeaders }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.subscribe();
      });

      expect(asyncHeaders).toHaveBeenCalled();
      expect(result.current.isSubscribed).toBe(true);
    });
  });
});
