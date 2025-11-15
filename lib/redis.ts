import IORedis from "ioredis";

const UPSTASH_REDIS_URL = process.env.UPSTASH_REDIS_URL;

// Define a lightweight Noop redis shape for when the env var is missing.
type NoopRedis = {
  on: (event: string, cb?: (...args: unknown[]) => void) => void;
  get: (key: string) => Promise<null>;
  set: (key: string, value: string) => Promise<null>;
  del: (key: string) => Promise<null>;
  __isNoop?: true;
};

// Derive the ioredis instance type from the constructor to avoid importing
// separate types and keep the typing accurate.
type IORedisInstance = InstanceType<typeof IORedis>;

// Use a single variable and export at the end to avoid `export` inside blocks
let redis: IORedisInstance | NoopRedis;

if (!UPSTASH_REDIS_URL) {
  // Avoid instantiating ioredis with an undefined URL because ioredis
  // will default to connecting to 127.0.0.1:6379 when no host is provided.
  // That is the root cause of the ECONNREFUSED logs in your deployment.
  console.error(
    "Missing UPSTASH_REDIS_URL environment variable. To avoid a default connection to 127.0.0.1:6379 the Redis client will not be created.\n" +
      "Set UPSTASH_REDIS_URL in your Vercel project settings to your Upstash rediss://... URL and redeploy."
  );

  // Minimal noop object to avoid runtime exceptions when code imports `redis`.
  redis = {
    on: () => undefined,
    get: async () => null,
    set: async () => null,
    del: async () => null,
    // marker to make debugging easier
    __isNoop: true,
  } as NoopRedis;
} else {
  redis = new IORedis(UPSTASH_REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  });

  redis.on("error", (err: Error & { command?: { name?: string } }) => {
    if (err.message.includes("NOPERM") && err.command?.name === "info") {
      console.warn(" Ignoring Upstash INFO permission error");
    } else {
      console.error("Redis connection error:", err);
    }
  });
}

export { redis };
