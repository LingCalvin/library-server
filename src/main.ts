import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet';
import * as fs from 'fs';

async function bootstrap() {
  // Patch TypeORM for easy support of transactions across service layer
  initializeTransactionalContext();
  patchTypeORMRepositoryWithBaseRepository();

  const httpsOptions =
    process.env.ENABLE_HTTPS === 'true'
      ? {
          key: fs.readFileSync(process.env.HTTPS_PRIVATE_KEY),
          cert: fs.readFileSync(process.env.HTTPS_PUBLIC_CERT),
        }
      : undefined;

  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.enableCors({ origin: process.env.CORS_ORIGIN, credentials: true });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.use(helmet());
  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
