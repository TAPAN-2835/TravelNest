import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export const getCachedData = async (key: string) => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

export const setCachedData = async (key: string, data: any, ttl: number = 3600) => {
  await redis.set(key, JSON.stringify(data), 'EX', ttl);
};

export const invalidateCache = async (pattern: string) => {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};
