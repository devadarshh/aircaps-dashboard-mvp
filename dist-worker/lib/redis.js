"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
exports.redis = new ioredis_1.default(process.env.UPSTASH_REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
});
exports.redis.on("error", (err) => {
    var _a;
    if (err.message.includes("NOPERM") && ((_a = err.command) === null || _a === void 0 ? void 0 : _a.name) === "info") {
        console.warn(" Ignoring Upstash INFO permission error");
    }
    else {
        console.error("Redis connection error:", err);
    }
});
