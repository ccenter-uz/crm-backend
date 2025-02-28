import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolePermissionModelDefinition } from 'src/models/schemas/role-permission.schema';

@Module({
  imports: [MongooseModule.forFeature([RolePermissionModelDefinition])],
  controllers: [],
  providers: [],
  exports: [],
})
export class RolePermissionModule {}
