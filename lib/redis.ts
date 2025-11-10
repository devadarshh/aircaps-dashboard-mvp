import IORedis from "ioredis";

export const redis = new IORedis(process.env.UPSTASH_REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});

redis.on("error", (err: Error & { command?: { name?: string } }) => {
  if (err.message.includes("NOPERM") && err.command?.name === "info") {
    console.warn("⚠️ Ignoring Upstash INFO permission error");
  } else {
    console.error("Redis connection error:", err);
  }
});
