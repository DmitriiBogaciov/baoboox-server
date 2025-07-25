import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { parse } from 'url';

async function bootstrap() {
  
const redisUrl = process.env.REDIS_URL!;
const parsed = parse(redisUrl);

const host = parsed.hostname!;
const redisPort = Number(parsed.port);

  const app = await NestFactory.create(AppModule, {
    snapshot: true,
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.enableCors();

  try {
    app.connectMicroservice({
      transport: Transport.REDIS,
      options: {
        host,
        port: redisPort,
        wildcards: true,
      },
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
