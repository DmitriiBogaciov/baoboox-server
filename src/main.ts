import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { Server } from 'http';

let cachedApp;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter, {
    snapshot: true,
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.enableCors();

  const port = process.env.PORT || 4000;
  
  if (process.env.NODE_ENV !== 'production') {
    await app.listen(port);
    Logger.log(`🚀 Server is running on http://localhost:${port}`, 'Bootstrap');
  } else {
    await app.init();
  }

  cachedApp = expressApp;
  return expressApp;
}

// Для локальной разработки
if (require.main === module) {
  bootstrap();
}

// Экспорт для serverless (AWS Lambda) - default export
export default async (event: any, context: any) => {
  const expressApp = await bootstrap();
  const serverlessExpress = require('@vendia/serverless-express');
  return serverlessExpress({ app: expressApp })(event, context);
};
