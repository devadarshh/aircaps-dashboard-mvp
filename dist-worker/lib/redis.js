"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const UPSTASH_REDIS_URL = process.env.UPSTASH_REDIS_URL;
// Use a single variable and export at the end to avoid `export` inside blocks
let redis;
if (!UPSTASH_REDIS_URL) {
    // Avoid instantiating ioredis with an undefined URL because ioredis
    // will default to connecting to 127.0.0.1:6379 when no host is provided.
    // That is the root cause of the ECONNREFUSED logs in your deployment.
    console.error("Missing UPSTASH_REDIS_URL environment variable. To avoid a default connection to 127.0.0.1:6379 the Redis client will not be created.\n" +
        "Set UPSTASH_REDIS_URL in your Vercel project settings to your Upstash rediss://... URL and redeploy.");
    // Minimal noop object to avoid runtime exceptions when code imports `redis`.
    exports.redis = redis = {
        on: () => undefined,
        get: async () => null,
        set: async () => null,
        del: async () => null,
        // marker to make debugging easier
        __isNoop: true,
    };
}
else {
    exports.redis = redis = new ioredis_1.default(UPSTASH_REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true,
    });
    redis.on("error", (err) => {
        var _a;
        if (err.message.includes("NOPERM") && ((_a = err.command) === null || _a === void 0 ? void 0 : _a.name) === "info") {
            console.warn(" Ignoring Upstash INFO permission error");
        }
        else {
            console.error("Redis connection error:", err);
        }
    });
}
