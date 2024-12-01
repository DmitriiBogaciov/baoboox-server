import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.enableCors();
  await app.listen(process.env.PORT || 4000);
  Logger.log(`Server is running on http://localhost:4000`, 'Bootstrap');
}

bootstrap();

