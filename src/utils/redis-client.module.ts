// redis-client.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'BOOK_SERVICE',
        useFactory: () => {
          const redisUrl = process.env.REDIS_URL;
          if (!redisUrl) throw new Error('REDIS_URL is not set');
          const url = new URL(redisUrl);
          return {
            transport: Transport.REDIS,
            options: {
              host: url.hostname,
              port: Number(url.port),
              password: url.password || undefined,
              wildcards: true,
              tls: url.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
            },
          };
        },
      },
    ]),
  ],
  exports: [ClientsModule], // главное — экспортировать ClientsModule!
})
export class RedisClientModule {}
// This module sets up a Redis client for microservices communication.
// It uses the REDIS_URL environment variable to configure the connection.