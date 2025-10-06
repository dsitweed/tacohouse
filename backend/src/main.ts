import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  await app.listen(process.env.PORT);
}

bootstrap().catch((error) => {
  console.error(`Have error when app start ${error}`);
});
