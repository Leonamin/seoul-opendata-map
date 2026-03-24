import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Seoul Open Data Real-time Map API')
    .setDescription('API for Seoul real-time population and commercial data')
    .setVersion('1.0')
    .addTag('locations', 'Seoul hotspot locations')
    .addTag('population', 'Population data')
    .addTag('commercial', 'Commercial data')
    .addTag('scenarios', 'Analysis scenarios')
    .addTag('reports', 'Comparison reports')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Run seed if --seed flag is passed
  if (process.argv.includes('--seed')) {
    const { DataSource } = await import('typeorm');
    const { seedSeoulHotspots } = await import('./database/seeds/seoul-hotspots.seed.js');
    const dataSource = app.get(DataSource);
    await seedSeoulHotspots(dataSource);
    console.log('Seeding complete');
  }

  const port = parseInt(process.env.PORT ?? '4000', 10);
  await app.listen(port);
  console.log(`Application running on port ${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
