import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { Server } from 'http';

let server: Server;
let app;

async function bootstrap() {
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);

  app = await NestFactory.create(AppModule, adapter, {
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

  return expressApp;
}

// Для локальной разработки
if (require.main === module) {
  bootstrap();
}

// Экспорт для serverless (AWS Lambda)
export const handler = async (event: any, context: any) => {
  if (!app) {
    const expressApp = await bootstrap();
    const serverlessExpress = require('@vendia/serverless-express');
    return serverlessExpress({ app: expressApp })(event, context);
  }
};
