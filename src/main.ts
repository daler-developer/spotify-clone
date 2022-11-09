import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import * as cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: 'dcupjdnqe',
  api_key: '765477428821251',
  api_secret: 'sFtUfwjC8wKEese5kx1qHYSQz7g',
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(4000);
}
bootstrap();
