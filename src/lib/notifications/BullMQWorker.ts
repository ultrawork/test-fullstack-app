import { Queue, Worker } from "bullmq";

/** Name of the BullMQ queue for email processing. */
export const QUEUE_NAME = "email-queue";

/** Interval in milliseconds for the repeating job (30 seconds). */
export const REPEAT_INTERVAL_MS = 30_000;

/** Redis connection configuration. */
export interface RedisConfig {
  host: string;
  port: number;
}

/** Returns Redis connection config from environment variables. */
export function getRedisConfig(): RedisConfig {
  return {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
  };
}

/** Creates the email queue with Redis connection. */
export function createEmailQueue(redisConfig?: RedisConfig): Queue {
  const connection = redisConfig ?? getRedisConfig();
  return new Queue(QUEUE_NAME, { connection });
}

/** Creates the email worker that calls the provided processQueue function. */
export function createEmailWorker(
  processQueue: () => Promise<void>,
  redisConfig?: RedisConfig,
): Worker {
  const connection = redisConfig ?? getRedisConfig();
  return new Worker(
    QUEUE_NAME,
    async (): Promise<void> => {
      await processQueue();
    },
    { connection },
  );
}

/** Adds a repeating job to process the email queue every 30 seconds. */
export async function addRecurringEmailJob(queue: Queue): Promise<void> {
  await queue.add(
    "process-email-queue",
    {},
    {
      repeat: {
        every: REPEAT_INTERVAL_MS,
      },
    },
  );
}

/** Starts the email worker system: creates queue, worker, and recurring job. */
export async function startEmailWorker(
  processQueue: () => Promise<void>,
  redisConfig?: RedisConfig,
): Promise<{ queue: Queue; worker: Worker }> {
  const queue = createEmailQueue(redisConfig);
  const worker = createEmailWorker(processQueue, redisConfig);
  await addRecurringEmailJob(queue);
  return { queue, worker };
}

/** Gracefully stops the email worker system (worker first, then queue). */
export async function stopEmailWorker(
  queue: Queue,
  worker: Worker,
): Promise<void> {
  await worker.close();
  await queue.close();
}
