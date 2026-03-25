import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3002',
  'http://localhost:3003',
  'http://127.0.0.1:3003',
  'http://localhost:3000',
  'https://admin.careseeker.app',
  'https://www.admin.careseeker.app',
  'https://client.careseeker.app',
  'https://www.client.careseeker.app',
  'https://provider.careseeker.app',
  'https://www.provider.careseeker.app',
  'https://careseeker.app',
  'https://www.careseeker.app',
];

const readAllowedOrigins = () => {
  const configured = process.env.CORS_ORIGINS;
  if (!configured) return DEFAULT_ALLOWED_ORIGINS;

  const parsed = configured
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...parsed]));
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = readAllowedOrigins();

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser clients (curl/postman) and same-origin requests.
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error(`Origin "${origin}" is not allowed by CORS`));
    },
    credentials: true,
  });

  const port = Number(process.env.PORT ?? 2000);

  await app.listen(port, '0.0.0.0');

  console.log(`Server running on port ${port}`);
}

bootstrap();
