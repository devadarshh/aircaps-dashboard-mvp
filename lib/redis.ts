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

// Treat "/" or empty string or non-redis URLs as invalid
const trimmedUrl = UPSTASH_REDIS_URL?.trim().replace(/['"]/g, "") || "";
const isValidUrl = 
  trimmedUrl !== "" && 
  trimmedUrl !== "/" && 
  (trimmedUrl.startsWith("redis://") || trimmedUrl.startsWith("rediss://"));

if (!isValidUrl) {
  // Avoid instantiating ioredis with an invalid URL
  console.warn(
    `⚠️ UPSTASH_REDIS_URL is ${trimmedUrl === "" ? "missing" : "invalid (" + trimmedUrl + ")"}. Redis client will not be created (using Noop fallback).\n` +
      "If you are running locally, set UPSTASH_REDIS_URL=redis://localhost:6379 in your .env file."
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
  try {
    redis = new IORedis(trimmedUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });

    redis.on("error", (err: Error & { command?: { name?: string } }) => {
      if (err.message.includes("NOPERM") && err.command?.name === "info") {
        console.warn(" Ignoring Upstash INFO permission error");
      } else {
        console.error("Redis connection error:", err.message);
      }
    });
  } catch (err) {
    console.error("Failed to initialize Redis client:", err);
    redis = {
      on: () => undefined,
      get: async () => null,
      set: async () => null,
      del: async () => null,
      __isNoop: true,
    } as NoopRedis;
  }
}

export { redis };
