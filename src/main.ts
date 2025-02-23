import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import { ValidationPipe } from '@nestjs/common';
import {
  AppConfig,
  CONFIG_APP_TOKEN,
  ValidatorConfig,
} from './common/config/app.config';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(new ValidationPipe(ValidatorConfig));
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>(CONFIG_APP_TOKEN);

  // app.useGlobalFilters(new AllExceptionFilter());

  await app.listen(appConfig.port, appConfig.host);
}
bootstrap();
