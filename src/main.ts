import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API de Normalización y Calculadora')
    .setDescription('Documentación de la API para los servicios de normalización y calculadora')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, document);

  app.enableCors({
    origin: 'https://ingenieria-grupomp.site',
    credentials: true,
  });

  app.enableCors();
  await app.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on port 3000');
  });
}
bootstrap();
