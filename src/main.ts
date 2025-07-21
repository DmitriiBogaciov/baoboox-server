import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.enableCors();

  try {
    // Redis config for Heroku or local
    let redisOptions;
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      const url = new URL(redisUrl);
      redisOptions = {
        host: url.hostname,
        port: parseInt(url.port) || 6379,
        password: url.password || undefined,
      tls: url.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
      };
    } else {
      redisOptions = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
      };
    }
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.REDIS,
      options: redisOptions,
    });

    await app.startAllMicroservices();
    Logger.log('Microservices started successfully', 'Bootstrap');
  } catch (error) {
    Logger.error('Microservices failed to start', error, 'Bootstrap');
    process.exit(1); // Остановка приложения, если микросервисы не запустились
  }

  const port = process.env.PORT || 4000;
  await app.listen(port);
  Logger.log(`🚀 Server is running on http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
