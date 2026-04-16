"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateCache = exports.setCachedData = exports.getCachedData = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
// ============================================================================
// 🔹 REDIS CACHING ARCHITECTURE
// Used to dramatically reduce PostgreSQL/MongoDB database load by caching:
//   1. Heavy AI-generated Itineraries
//   2. Destination metrics & metadata
// This improves API response latency from ~3000ms down to ~50ms for repeat access.
// ============================================================================
const redis = new ioredis_1.default(process.env.REDIS_URL);
const getCachedData = async (key) => {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
};
exports.getCachedData = getCachedData;
const setCachedData = async (key, data, ttl = 3600) => {
    await redis.set(key, JSON.stringify(data), 'EX', ttl);
};
exports.setCachedData = setCachedData;
const invalidateCache = async (pattern) => {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
        await redis.del(...keys);
    }
};
exports.invalidateCache = invalidateCache;
//# sourceMappingURL=cache.utils.js.map