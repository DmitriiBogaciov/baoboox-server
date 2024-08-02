import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { auth } from 'express-oauth2-jwt-bearer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  app.use(auth({
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    audience: process.env.AUTH0_AUDIENCE,
  }));

  app.use((req, res, next) => {
    next();
  });
  
  app.enableCors();
  await app.listen(4000);
  Logger.log(`Server is running on http://localhost:4000`, 'Bootstrap');
}
bootstrap();
