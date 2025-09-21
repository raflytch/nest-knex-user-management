import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('User Management API')
    .setDescription('API for managing users with JWT authentication')
    .setVersion('1.0')
    .addTag('users')
    .addBearerAuth()
    .build();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const document = SwaggerModule.createDocument(app as any, config);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  SwaggerModule.setup('api', app as any, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
