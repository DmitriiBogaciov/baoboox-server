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
      retryStrategy: (times: number) => {
        // Ограничиваем количество попыток переподключения
        if (times > 3) {
          console.warn('Redis connection failed after 3 attempts, disabling Redis');
          return null; // Останавливаем попытки переподключения
        }
        return Math.min(times * 100, 3000); // Экспоненциальная задержка
      },
    };
  }
  return null;
};

const connectionConfig = createRedisConnection();

let pubSubInstance: RedisPubSub | null = null;

if (connectionConfig) {
  try {
    pubSubInstance = new RedisPubSub({ connection: connectionConfig });

    // Обработка ошибок подключения
    const publisher = (pubSubInstance as any).getPublisher?.();
    const subscriber = (pubSubInstance as any).getSubscriber?.();

    [publisher, subscriber].forEach((client) => {
      if (client) {
        client.on('error', (err: Error) => {
          console.warn('Redis connection error:', err.message);
          // Не бросаем ошибку, просто логируем
        });

        client.on('connect', () => {
          console.log('Redis connected successfully');
        });

        client.on('ready', () => {
          console.log('Redis ready');
        });
      }
    });
  } catch (error) {
    console.warn('Failed to initialize Redis PubSub:', error instanceof Error ? error.message : error);
    pubSubInstance = null;
  }
}

export const pubSub = pubSubInstance;