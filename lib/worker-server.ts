import { worker } from "@/lib/worker";

const w = worker;

if (w) {
  w.on("completed", (job) => {
    console.log(`Job ${job?.id} completed`);
  });

  w.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully...");
    try {
      await w.close();
    } catch (err) {
      console.error("Error closing worker:", err);
    }
    process.exit(0);
  });

  console.log("Worker background process initialized");
} else {
  console.warn("Worker is not initialized (null). Background process not started.");
}
