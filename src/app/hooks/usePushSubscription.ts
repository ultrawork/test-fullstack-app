'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

/* ------------------------------------------------------------------ */
/*  Types & Interfaces                                                 */
/* ------------------------------------------------------------------ */

/** Configuration for the usePushSubscription hook. */
export interface PushSubscriptionConfig {
  /** Path to the service worker file. */
  serviceWorkerPath: string;
  /** URL to fetch the VAPID public key from. */
  vapidPublicKeyUrl: string;
  /** URL to post a new subscription to. */
  subscribeUrl: string;
  /** URL to post unsubscribe payload to. */
  unsubscribeUrl: string;
  /** Static headers or async function that resolves headers. */
  headers:
    | Record<string, string>
    | (() => Record<string, string> | Promise<Record<string, string>>);
  /** Called after a successful subscribe. */
  onSubscribe?: (subscription: PushSubscriptionJSON) => void;
  /** Called after a successful unsubscribe. */
  onUnsubscribe?: () => void;
  /** Called when any error occurs. */
  onError?: (error: Error) => void;
}

export interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  isLoading: boolean;
  error: Error | null;
  permission: NotificationPermission | null;
}

export interface UsePushSubscriptionReturn extends PushSubscriptionState {
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  refresh: () => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

export const DEFAULT_CONFIG: PushSubscriptionConfig = {
  serviceWorkerPath: '/sw.js',
  vapidPublicKeyUrl: '/api/push/vapid-public-key',
  subscribeUrl: '/api/push/subscribe',
  unsubscribeUrl: '/api/push/unsubscribe',
  headers: { 'Content-Type': 'application/json' },
};

/* ------------------------------------------------------------------ */
/*  Pure utilities                                                     */
/* ------------------------------------------------------------------ */

/** Converts a URL-safe base64 string to a Uint8Array (for applicationServerKey). */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/** Converts a PushSubscription to a JSON-serialisable payload for the server. */
export function toServerPayload(
  subscription: PushSubscription,
): PushSubscriptionJSON {
  return subscription.toJSON();
}

/* ------------------------------------------------------------------ */
/*  Server helpers                                                     */
/* ------------------------------------------------------------------ */

/** Resolves headers — supports both static objects and async functions. */
export async function getHeadersResolved(
  headers: PushSubscriptionConfig['headers'],
): Promise<Record<string, string>> {
  if (typeof headers === 'function') {
    return await headers();
  }
  return headers;
}

/** Fetches the VAPID public key from the server. */
export async function fetchVapidPublicKey(
  url: string,
  headers: PushSubscriptionConfig['headers'],
): Promise<string> {
  const resolved = await getHeadersResolved(headers);
  const response = await fetch(url, { headers: resolved });
  if (!response.ok) {
    throw new Error(`Failed to fetch VAPID public key: ${response.status}`);
  }
  const data: unknown = await response.json();
  if (
    typeof data === 'object' &&
    data !== null &&
    'publicKey' in data &&
    typeof (data as Record<string, unknown>).publicKey === 'string'
  ) {
    return (data as Record<string, string>).publicKey;
  }
  throw new Error('Invalid VAPID public key response');
}

/** Posts a subscription to the server. */
export async function postSubscribe(
  url: string,
  headers: PushSubscriptionConfig['headers'],
  payload: PushSubscriptionJSON,
): Promise<void> {
  const resolved = await getHeadersResolved(headers);
  const response = await fetch(url, {
    method: 'POST',
    headers: resolved,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to subscribe on server: ${response.status}`);
  }
}

/** Posts an unsubscribe request to the server. */
export async function postUnsubscribe(
  url: string,
  headers: PushSubscriptionConfig['headers'],
  payload: PushSubscriptionJSON,
): Promise<void> {
  const resolved = await getHeadersResolved(headers);
  const response = await fetch(url, {
    method: 'POST',
    headers: resolved,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to unsubscribe on server: ${response.status}`);
  }
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function usePushSubscription(
  userConfig: Partial<PushSubscriptionConfig> = {},
): UsePushSubscriptionReturn {
  const config: PushSubscriptionConfig = { ...DEFAULT_CONFIG, ...userConfig };
  const configRef = useRef(config);
  configRef.current = config;

  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    subscription: null,
    isLoading: false,
    error: null,
    permission: null,
  });

  /* ---- internal helpers ---- */

  const handleError = useCallback(
    (err: unknown): void => {
      const error = err instanceof Error ? err : new Error(String(err));
      setState((prev) => ({ ...prev, error, isLoading: false }));
      configRef.current.onError?.(error);
    },
    [],
  );

  const checkSupport = useCallback((): boolean => {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }, []);

  /* ---- actions ---- */

  const registerServiceWorker =
    useCallback(async (): Promise<ServiceWorkerRegistration> => {
      const registration = await navigator.serviceWorker.register(
        configRef.current.serviceWorkerPath,
      );
      return registration;
    }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    const permission = await Notification.requestPermission();
    setState((prev) => ({ ...prev, permission }));
    if (permission !== 'granted') {
      throw new Error(`Notification permission ${permission}`);
    }
    return permission;
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const supported = checkSupport();
      if (!supported) {
        setState((prev) => ({
          ...prev,
          isSupported: false,
          isSubscribed: false,
          subscription: null,
          isLoading: false,
          permission: null,
        }));
        return;
      }
      const permission = Notification.permission;
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setState({
        isSupported: true,
        isSubscribed: subscription !== null,
        subscription,
        isLoading: false,
        error: null,
        permission,
      });
    } catch (err) {
      handleError(err);
    }
  }, [checkSupport, handleError]);

  const subscribe = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const cfg = configRef.current;

      const registration = await registerServiceWorker();
      await requestPermission();

      const vapidPublicKey = await fetchVapidPublicKey(
        cfg.vapidPublicKeyUrl,
        cfg.headers,
      );
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      const payload = toServerPayload(subscription);
      await postSubscribe(cfg.subscribeUrl, cfg.headers, payload);

      setState((prev) => ({
        ...prev,
        isSubscribed: true,
        subscription,
        isLoading: false,
        error: null,
        permission: 'granted',
      }));

      cfg.onSubscribe?.(payload);
    } catch (err) {
      handleError(err);
    }
  }, [registerServiceWorker, requestPermission, handleError]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const cfg = configRef.current;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const payload = toServerPayload(subscription);
        await postUnsubscribe(cfg.unsubscribeUrl, cfg.headers, payload);
        await subscription.unsubscribe();
      }

      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
        isLoading: false,
        error: null,
      }));

      cfg.onUnsubscribe?.();
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  /* ---- initialisation ---- */

  useEffect(() => {
    const supported = checkSupport();
    if (!supported) {
      setState((prev) => ({ ...prev, isSupported: false }));
      return;
    }
    setState((prev) => ({ ...prev, isSupported: true }));
    void refresh();
  }, [checkSupport, refresh]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    refresh,
  };
}
