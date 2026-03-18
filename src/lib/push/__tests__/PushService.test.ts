import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FetchFn, PushPayload, PushResult } from "../PushService";
import { HttpPushService } from "../PushService";

function mockFetch(
  status: number,
  body: Record<string, unknown> = {},
): FetchFn {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response);
}

const ENDPOINT = "https://push.example.com/send";

function makePayload(overrides?: Partial<PushPayload>): PushPayload {
  return {
    token: "device-token-abc",
    title: "Test title",
    body: "Test body",
    ...overrides,
  };
}

describe("HttpPushService", () => {
  let fetchFn: ReturnType<typeof vi.fn>;
  let service: HttpPushService;

  beforeEach(() => {
    fetchFn = mockFetch(200, { ok: true });
    service = new HttpPushService(ENDPOINT, fetchFn);
  });

  describe("constructor", () => {
    it("stores the endpoint", () => {
      expect(service).toBeDefined();
    });
  });

  describe("send", () => {
    it("sends POST request to the configured endpoint", async () => {
      const payload = makePayload();
      await service.send(payload);

      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(fetchFn).toHaveBeenCalledWith(
        ENDPOINT,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        }),
      );
    });

    it("includes payload in the request body as JSON", async () => {
      const payload = makePayload({ data: { noteId: "123" } });
      await service.send(payload);

      const callArgs = fetchFn.mock.calls[0];
      const sentBody = JSON.parse(callArgs[1].body as string) as PushPayload;

      expect(sentBody.token).toBe(payload.token);
      expect(sentBody.title).toBe(payload.title);
      expect(sentBody.body).toBe(payload.body);
      expect(sentBody.data).toEqual({ noteId: "123" });
    });

    it("returns success result on HTTP 200", async () => {
      const payload = makePayload();
      const result: PushResult = await service.send(payload);

      expect(result.success).toBe(true);
      expect(result.token).toBe(payload.token);
      expect(result.error).toBeUndefined();
    });

    it("returns failure result on HTTP 4xx", async () => {
      fetchFn = mockFetch(400, { error: "Bad request" });
      service = new HttpPushService(ENDPOINT, fetchFn);

      const payload = makePayload();
      const result = await service.send(payload);

      expect(result.success).toBe(false);
      expect(result.token).toBe(payload.token);
      expect(result.error).toBeDefined();
    });

    it("returns failure result on HTTP 5xx", async () => {
      fetchFn = mockFetch(500);
      service = new HttpPushService(ENDPOINT, fetchFn);

      const payload = makePayload();
      const result = await service.send(payload);

      expect(result.success).toBe(false);
      expect(result.token).toBe(payload.token);
      expect(result.error).toBeDefined();
    });

    it("returns failure result when fetch throws (network error)", async () => {
      fetchFn = vi.fn().mockRejectedValue(new Error("Network error"));
      service = new HttpPushService(ENDPOINT, fetchFn);

      const payload = makePayload();
      const result = await service.send(payload);

      expect(result.success).toBe(false);
      expect(result.token).toBe(payload.token);
      expect(result.error).toBe("Network error");
    });

    it("handles payload without optional data field", async () => {
      const payload: PushPayload = {
        token: "tok",
        title: "T",
        body: "B",
      };
      const result = await service.send(payload);

      expect(result.success).toBe(true);
      const sentBody = JSON.parse(
        fetchFn.mock.calls[0][1].body as string,
      ) as PushPayload;
      expect(sentBody.data).toBeUndefined();
    });
  });

  describe("sendBatch", () => {
    it("sends each payload independently and returns all results", async () => {
      const payloads = [
        makePayload({ token: "tok-1" }),
        makePayload({ token: "tok-2" }),
        makePayload({ token: "tok-3" }),
      ];

      const results = await service.sendBatch(payloads);

      expect(results).toHaveLength(3);
      expect(fetchFn).toHaveBeenCalledTimes(3);
      expect(results.every((r) => r.success)).toBe(true);
      expect(results.map((r) => r.token)).toEqual([
        "tok-1",
        "tok-2",
        "tok-3",
      ]);
    });

    it("returns empty array for empty input", async () => {
      const results = await service.sendBatch([]);

      expect(results).toEqual([]);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it("handles mixed success and failure in batch", async () => {
      let callCount = 0;
      const mixedFetch: FetchFn = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          return Promise.resolve({
            ok: false,
            status: 410,
            json: () => Promise.resolve({ error: "Gone" }),
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({}),
        });
      });
      service = new HttpPushService(ENDPOINT, mixedFetch);

      const payloads = [
        makePayload({ token: "ok-1" }),
        makePayload({ token: "fail-1" }),
        makePayload({ token: "ok-2" }),
      ];

      const results = await service.sendBatch(payloads);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);
    });

    it("does not abort batch when one send throws", async () => {
      let callCount = 0;
      const throwingFetch: FetchFn = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error("Timeout"));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({}),
        });
      });
      service = new HttpPushService(ENDPOINT, throwingFetch);

      const payloads = [
        makePayload({ token: "err" }),
        makePayload({ token: "ok" }),
      ];

      const results = await service.sendBatch(payloads);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBe("Timeout");
      expect(results[1].success).toBe(true);
    });
  });
});
