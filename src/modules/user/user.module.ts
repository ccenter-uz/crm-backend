import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import * as Config from '../../common/config/app.config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModelDefinition } from 'src/models/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([UserModelDefinition]),
    JwtModule.register({
      secret: Config.JwtConfig.secret,
      signOptions: { expiresIn: Config.JwtConfig.expiresIn },
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
