import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { model, ObjectId, Document } from 'mongoose';
import { DefaultStatusEnum, UserRoleEnum } from 'src/types/global/constants';
import { DefaultStatusType, UserRoleType } from 'src/types/global/types';

export type UserDocument = User & Document;

@Schema({ versionKey: false })
export class User {
  _id: ObjectId;

  @Prop({ type: String, required: true })
  full_name: string;

  @Prop({ type: String, required: true, unique: true })
  username: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, enum: UserRoleEnum, required: true })
  role: UserRoleType;

  @Prop({
    type: Number,
    enum: DefaultStatusEnum,
    required: true,
    default: DefaultStatusEnum.Active,
  })
  status: DefaultStatusType;

  // organization_id

  @Prop({ type: Number, required: true })
  created_at: number;

  @Prop({ type: Number, required: true })
  updated_at: number;

  @Prop({ type: Number, required: true })
  deleted_at: number;
}

const collectionName = 'USER';
export const UserSchema = SchemaFactory.createForClass(User);
export const UserModelDefinition: ModelDefinition = {
  name: User.name,
  schema: UserSchema,
  collection: collectionName,
};
model(User.name, UserSchema, collectionName);
