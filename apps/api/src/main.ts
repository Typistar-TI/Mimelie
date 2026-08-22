import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { json } from 'express';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const origins = (process.env.WEB_ORIGIN ?? 'http://localhost:3000').split(',').map((value) => value.trim());
  app.setGlobalPrefix('v1');
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' }));
  app.use(json({ limit: '256kb' }));
  app.use(cookieParser());
  app.enableCors({ origin: (origin: string | undefined, done: (error: Error | null, allow?: boolean) => void) => done(origin == null || origins.includes(origin) ? null : new Error('Origin not allowed'), true), credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  const docs = new DocumentBuilder().setTitle('Mimelie API').setVersion('1').addCookieAuth('mimelie_session').build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, docs));
  await app.listen(Number(process.env.API_PORT ?? 3001), '0.0.0.0');
}

void bootstrap();
