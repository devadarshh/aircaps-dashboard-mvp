import { Worker } from "bullmq";
import type { WorkerOptions } from "bullmq";

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
