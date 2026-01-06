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
// Treat "/" or empty string or non-redis URLs as invalid
const trimmedUrl = (UPSTASH_REDIS_URL === null || UPSTASH_REDIS_URL === void 0 ? void 0 : UPSTASH_REDIS_URL.trim().replace(/['"]/g, "")) || "";
const isValidUrl = trimmedUrl !== "" &&
    trimmedUrl !== "/" &&
    (trimmedUrl.startsWith("redis://") || trimmedUrl.startsWith("rediss://"));
if (!isValidUrl) {
    // Avoid instantiating ioredis with an invalid URL
    console.warn(`⚠️ UPSTASH_REDIS_URL is ${trimmedUrl === "" ? "missing" : "invalid (" + trimmedUrl + ")"}. Redis client will not be created (using Noop fallback).\n` +
        "If you are running locally, set UPSTASH_REDIS_URL=redis://localhost:6379 in your .env file.");
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
    try {
        exports.redis = redis = new ioredis_1.default(trimmedUrl, {
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
                console.error("Redis connection error:", err.message);
            }
        });
    }
    catch (err) {
        console.error("Failed to initialize Redis client:", err);
        exports.redis = redis = {
            on: () => undefined,
            get: async () => null,
            set: async () => null,
            del: async () => null,
            __isNoop: true,
        };
    }
}
