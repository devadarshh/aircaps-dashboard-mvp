import { worker } from "@/lib/worker";

// Initialize the worker and keep it running in the background
worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await worker.close();
  process.exit(0);
});

console.log("Worker background process initialized");
