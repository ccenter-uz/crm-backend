import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appConfig, dbConfig } from './common/config/app.config';
import { MongooseModule } from '@nestjs/mongoose';
import { TestModule } from './modules/test/test.module';

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

    // Schema models
    MongooseModule.forFeature([]),

    // Modules
    TestModule,
  ],
  providers: [],
})
export class AppModule {}
