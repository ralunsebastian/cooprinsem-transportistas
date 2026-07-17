import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Vacío en QA/hosting: Passenger monta la app ya bajo /api
  const apiPrefix = config.get<string>('API_PREFIX', 'api');
  if (apiPrefix) app.setGlobalPrefix(apiPrefix);

  // La API nunca debe cachearse (el mod_cache de Apache en el hosting marca
  // las respuestas como públicas y sirve versiones antiguas si no se prohíbe)
  app.use((_req: unknown, res: { setHeader: (k: string, v: string) => void }, next: () => void) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.enableCors({
    origin: (config.get<string>('FRONT_ORIGINS') ?? '').split(',').filter(Boolean),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  const port = config.get<number>('PORT') ?? 3002;
  await app.listen(port);
  console.log(`Cooprinsem Transportistas API escuchando en http://localhost:${port}/api`);
}
bootstrap();
