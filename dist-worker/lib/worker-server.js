"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_1 = require("@/lib/worker");
worker_1.worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});
worker_1.worker.on("failed", (job, err) => {
    console.error(`Job ${job === null || job === void 0 ? void 0 : job.id} failed:`, err);
});
// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully...");
    await worker_1.worker.close();
    process.exit(0);
});
console.log("Worker background process initialized");
