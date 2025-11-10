import { Worker } from "bullmq";
import IORedis from "ioredis";
import type { WorkerOptions } from "bullmq";

interface FileJobData {
  fileId: string;
}

const connection = new IORedis(process.env.UPSTASH_REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});

connection.on("error", (err: Error & { command?: { name?: string } }) => {
  if (err.message.includes("NOPERM") && err.command?.name === "info") {
    console.warn("Ignoring Upstash INFO permission error");
  } else {
    console.error("Redis connection error:", err);
  }
});
const workerOptions: WorkerOptions = {
  concurrency: 10,
  connection,
  skipVersionCheck: true,
};

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    console.log(`Processing job ${job.id} with data:`, job.data);
  },
  workerOptions
);

export { worker };
