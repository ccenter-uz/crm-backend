import { registerAs } from '@nestjs/config';
import * as process from 'process';

export const CONFIG_APP_TOKEN = 'app';
export const CONFIG_PRISMA_DB_TOKEN = 'db';

export const appConfig = registerAs(
  CONFIG_APP_TOKEN,
  (): AppConfig => ({
    host: process.env.APP_HOST || '0.0.0.0',
    port: parseInt(process.env.APP_PORT) || 9000,
    cors_domains: process.env.CORS_DOMAINS || '*',
  })
);

export const dbConfig = registerAs(
  CONFIG_PRISMA_DB_TOKEN,
  (): DbConfig => ({
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/crm',
  })
);

export type AppConfig = {
  host: string;
  port: number;
  cors_domains: string;
};

export type DbConfig = {
  url: string;
};

export const ValidatorConfig = {
  transform: true,
  stopAtFirstError: true,
  whitelist: true,
};

export const JwtConfig = {
  secret: process.env.JWT_SECRET_KEY || 'secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '10d',
};
