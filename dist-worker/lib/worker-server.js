"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_1 = require("@/lib/worker");
const w = worker_1.worker;
if (w) {
    w.on("completed", (job) => {
        console.log(`Job ${job === null || job === void 0 ? void 0 : job.id} completed`);
    });
    w.on("failed", (job, err) => {
        console.error(`Job ${job === null || job === void 0 ? void 0 : job.id} failed:`, err);
    });
    // Graceful shutdown
    process.on("SIGTERM", async () => {
        console.log("SIGTERM received, shutting down gracefully...");
        try {
            await w.close();
        }
        catch (err) {
            console.error("Error closing worker:", err);
        }
        process.exit(0);
    });
    console.log("Worker background process initialized");
}
else {
    console.warn("Worker is not initialized (null). Background process not started.");
}
