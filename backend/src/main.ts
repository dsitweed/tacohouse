import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';
import * as path from 'path';

import { AppModule } from './app.module';
import {
  LoggingInterceptor,
  TransformResponseInterceptor,
} from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS Configuration
  const allowedOrigins: string[] = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
    : ['http://localhost:3000'];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('TacoHouse API')
    .setDescription(
      'A comprehensive rental room management system API for managing buildings, rooms, tenants, billing, and payments.\n\n' +
        '## Response Format\n' +
        'All responses follow a standardized format:\n' +
        '- **status**: HTTP status code\n' +
        '- **message**: Human-readable message\n' +
        '- **data**: Response data (object or array)\n' +
        '- **pagination**: (Optional) Pagination metadata for list endpoints',
    )
    .setVersion('1.0.0')
    .addServer('http://localhost:3005', 'Development server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Buildings', 'Building management endpoints')
    .addTag('Rooms', 'Room management endpoints')
    .addTag('Rentals', 'Rental management endpoints')
    .addTag('Bills', 'Bill management endpoints')
    .addTag('Payments', 'Payment management endpoints')
    .addTag('Maintenance', 'Maintenance request endpoints')
    .addTag('Chat', 'Chat and messaging endpoints')
    .addTag('Notifications', 'Notification endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const outputPath = path.resolve(process.cwd(), 'swagger.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error(`Have error when app start ${error}`);
});
