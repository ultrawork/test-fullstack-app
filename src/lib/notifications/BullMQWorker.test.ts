import { describe, it, expect, vi, beforeEach } from "vitest";

const mockQueueAdd = vi.fn().mockResolvedValue(undefined);
const mockQueueClose = vi.fn().mockResolvedValue(undefined);
const mockWorkerClose = vi.fn().mockResolvedValue(undefined);

let capturedProcessor: ((job: unknown) => Promise<void>) | null = null;

vi.mock("bullmq", () => ({
  Queue: vi.fn().mockImplementation(function (
    this: Record<string, unknown>,
    _name: string,
    opts: unknown,
  ) {
    this.name = _name;
    this.opts = opts;
    this.add = mockQueueAdd;
    this.close = mockQueueClose;
  }),
  Worker: vi.fn().mockImplementation(function (
    this: Record<string, unknown>,
    _name: string,
    processor: (job: unknown) => Promise<void>,
    _opts: unknown,
  ) {
    capturedProcessor = processor;
    this.name = _name;
    this.opts = _opts;
    this.close = mockWorkerClose;
  }),
}));

import { Queue, Worker } from "bullmq";
import {
  QUEUE_NAME,
  REPEAT_INTERVAL_MS,
  getRedisConfig,
  createEmailQueue,
  createEmailWorker,
  addRecurringEmailJob,
  startEmailWorker,
  stopEmailWorker,
} from "./BullMQWorker";

describe("BullMQWorker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedProcessor = null;
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
  });

  describe("constants", () => {
    it('should export queue name as "email-queue"', () => {
      expect(QUEUE_NAME).toBe("email-queue");
    });

    it("should export repeat interval as 30000ms", () => {
      expect(REPEAT_INTERVAL_MS).toBe(30_000);
    });
  });

  describe("getRedisConfig", () => {
    it("should return default config when env vars are not set", () => {
      const config = getRedisConfig();
      expect(config).toEqual({ host: "localhost", port: 6379 });
    });

    it("should use REDIS_HOST env var when set", () => {
      process.env.REDIS_HOST = "redis.example.com";
      const config = getRedisConfig();
      expect(config.host).toBe("redis.example.com");
    });

    it("should use REDIS_PORT env var when set", () => {
      process.env.REDIS_PORT = "6380";
      const config = getRedisConfig();
      expect(config.port).toBe(6380);
    });

    it("should use both env vars together", () => {
      process.env.REDIS_HOST = "my-redis";
      process.env.REDIS_PORT = "6381";
      const config = getRedisConfig();
      expect(config).toEqual({ host: "my-redis", port: 6381 });
    });
  });

  describe("createEmailQueue", () => {
    it("should create a Queue with correct name and connection", () => {
      const queue = createEmailQueue();

      expect(Queue).toHaveBeenCalledWith(QUEUE_NAME, {
        connection: { host: "localhost", port: 6379 },
      });
      expect(queue).toBeDefined();
      expect(queue.add).toBeDefined();
    });

    it("should use custom redis config when provided", () => {
      const customConfig = { host: "custom-host", port: 1234 };
      createEmailQueue(customConfig);

      expect(Queue).toHaveBeenCalledWith(QUEUE_NAME, {
        connection: customConfig,
      });
    });
  });

  describe("createEmailWorker", () => {
    it("should create a Worker with correct queue name and connection", () => {
      const processQueue = vi.fn().mockResolvedValue(undefined);
      const worker = createEmailWorker(processQueue);

      expect(Worker).toHaveBeenCalledWith(
        QUEUE_NAME,
        expect.any(Function),
        { connection: { host: "localhost", port: 6379 } },
      );
      expect(worker).toBeDefined();
      expect(worker.close).toBeDefined();
    });

    it("should use custom redis config when provided", () => {
      const processQueue = vi.fn().mockResolvedValue(undefined);
      const customConfig = { host: "custom-host", port: 9999 };
      createEmailWorker(processQueue, customConfig);

      expect(Worker).toHaveBeenCalledWith(QUEUE_NAME, expect.any(Function), {
        connection: customConfig,
      });
    });

    it("should call processQueue when worker processor is invoked", async () => {
      const processQueue = vi.fn().mockResolvedValue(undefined);
      createEmailWorker(processQueue);

      expect(capturedProcessor).not.toBeNull();
      await capturedProcessor!({});

      expect(processQueue).toHaveBeenCalledTimes(1);
    });
  });

  describe("addRecurringEmailJob", () => {
    it("should add a repeating job to the queue", async () => {
      const queue = createEmailQueue();
      await addRecurringEmailJob(queue);

      expect(mockQueueAdd).toHaveBeenCalledWith(
        "process-email-queue",
        {},
        {
          repeat: {
            every: REPEAT_INTERVAL_MS,
          },
        },
      );
    });

    it("should add job with 30-second repeat interval", async () => {
      const queue = createEmailQueue();
      await addRecurringEmailJob(queue);

      const callArgs = mockQueueAdd.mock.calls[0];
      expect(callArgs[2].repeat.every).toBe(30_000);
    });
  });

  describe("startEmailWorker", () => {
    it("should create queue, worker, and add recurring job", async () => {
      const processQueue = vi.fn().mockResolvedValue(undefined);
      const result = await startEmailWorker(processQueue);

      expect(result.queue).toBeDefined();
      expect(result.worker).toBeDefined();
      expect(Queue).toHaveBeenCalledTimes(1);
      expect(Worker).toHaveBeenCalledTimes(1);
      expect(mockQueueAdd).toHaveBeenCalledTimes(1);
    });

    it("should pass processQueue to the worker", async () => {
      const processQueue = vi.fn().mockResolvedValue(undefined);
      await startEmailWorker(processQueue);

      expect(capturedProcessor).not.toBeNull();
      await capturedProcessor!({});
      expect(processQueue).toHaveBeenCalledTimes(1);
    });

    it("should use custom redis config for both queue and worker", async () => {
      const processQueue = vi.fn().mockResolvedValue(undefined);
      const customConfig = { host: "prod-redis", port: 6380 };
      await startEmailWorker(processQueue, customConfig);

      expect(Queue).toHaveBeenCalledWith(QUEUE_NAME, {
        connection: customConfig,
      });
      expect(Worker).toHaveBeenCalledWith(QUEUE_NAME, expect.any(Function), {
        connection: customConfig,
      });
    });
  });

  describe("stopEmailWorker", () => {
    it("should close both worker and queue", async () => {
      const processQueue = vi.fn().mockResolvedValue(undefined);
      const { queue, worker } = await startEmailWorker(processQueue);

      await stopEmailWorker(queue, worker);

      expect(mockWorkerClose).toHaveBeenCalledTimes(1);
      expect(mockQueueClose).toHaveBeenCalledTimes(1);
    });

    it("should close worker before queue", async () => {
      const callOrder: string[] = [];
      mockWorkerClose.mockImplementation(async () => {
        callOrder.push("worker");
      });
      mockQueueClose.mockImplementation(async () => {
        callOrder.push("queue");
      });

      const processQueue = vi.fn().mockResolvedValue(undefined);
      const { queue, worker } = await startEmailWorker(processQueue);
      await stopEmailWorker(queue, worker);

      expect(callOrder).toEqual(["worker", "queue"]);
    });
  });
});
