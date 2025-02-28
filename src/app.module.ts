import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appConfig, dbConfig } from './common/config/app.config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { UserModelDefinition } from './models/schemas/user.schema';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionFilter } from './common/filter/all-exceptions.filter';
import { RolePermissionModule } from './modules/role-permission/role-permission.module';

@Module({
  imports: [
    // Setting configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig],
    }),

    // Connecting to MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('db.url'),
      }),
      inject: [ConfigService],
    }),

    // Modules
    UserModule,
    RolePermissionModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule {}
