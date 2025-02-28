import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { model, ObjectId, Document } from 'mongoose';
import { DefaultStatusEnum, UserRoleEnum } from 'src/types/global/constants';
import {
  DefaultStatusType,
  PermissionsType,
  UserRoleType,
} from 'src/types/global/types';

export type RolePermissionDocument = RolePermission & Document;

@Schema({ versionKey: false })
export class RolePermission {
  _id: ObjectId;

  @Prop({ type: String, enum: UserRoleEnum, required: true })
  role: UserRoleType;

  @Prop({
    type: Number,
    enum: DefaultStatusEnum,
    required: true,
    default: DefaultStatusEnum.Active,
  })
  status: DefaultStatusType;

  @Prop({ type: Array, required: true })
  permissions: PermissionsType[];

  @Prop({ type: Number, required: true })
  created_at: number;

  @Prop({ type: Number, required: false })
  updated_at: number;

  @Prop({ type: Number, required: false })
  deleted_at: number;
}

const collectionName = 'ROLE_PERMISSION';
export const RolePermissionSchema =
  SchemaFactory.createForClass(RolePermission);
export const RolePermissionModelDefinition: ModelDefinition = {
  name: RolePermission.name,
  schema: RolePermissionSchema,
  collection: collectionName,
};
model(RolePermission.name, RolePermissionSchema, collectionName);
