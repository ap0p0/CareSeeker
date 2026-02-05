import { config } from 'dotenv';

config();
config({ path: '.env.local' });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env['PORT'] ?? 2000;
  await app.listen(port);
}

bootstrap();
