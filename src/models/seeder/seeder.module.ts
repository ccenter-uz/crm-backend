import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModelDefinition } from 'src/models/schemas/user.schema';
import { UserModule } from 'src/modules/user/user.module';
import { UserSeedService } from './user-seed.service';

@Module({
  imports: [MongooseModule.forFeature([UserModelDefinition]), UserModule],
  providers: [UserSeedService],
  exports: [UserSeedService],
})
export class SeederModule {}
