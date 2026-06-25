import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

type ValidationDetail = {
  field: string;
  issue: string;
};

function validationDetails(errors: ValidationError[], parent = ''): ValidationDetail[] {
  return errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;
    const ownErrors = Object.values(error.constraints ?? {}).map((issue) => ({
      field,
      issue,
    }));
    const childErrors = validationDetails(error.children ?? [], field);

    return [...ownErrors, ...childErrors];
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          error: 'VALIDACAO_INVALIDA',
          message: 'Dados inválidos na requisição.',
          details: validationDetails(errors),
        }),
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Backend Trail Lanchonete')
    .setDescription('API para rede de lanchonetes com pedidos, estoque e pagamento com mock.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
}

bootstrap();
