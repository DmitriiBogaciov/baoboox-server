import { RedisPubSub } from 'graphql-redis-subscriptions';
import { parse } from 'url';

const createRedisConnection = () => {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    const parsed = parse(redisUrl);
    const isTls = parsed.protocol === 'rediss:';
    return {
      host: parsed.hostname!,
      port: Number(parsed.port),
      password: parsed.auth ? parsed.auth.split(':')[1] : undefined,
      tls: isTls ? { rejectUnauthorized: false } : undefined,
    };
  } else {
    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    };
  }
};

export const pubSub = new RedisPubSub({
  connection: createRedisConnection(),
});