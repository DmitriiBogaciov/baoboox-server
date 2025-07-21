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
      host: 'localhost',
      port: 6379,
    };
  }
};

export const pubsub = new RedisPubSub({
  connection: createRedisConnection(),
});