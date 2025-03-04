import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { model, ObjectId, Document } from 'mongoose';
import { DefaultStatusEnum, UserRoleEnum } from 'src/types/global/constants';
import { DefaultStatusType, UserRoleType } from 'src/types/global/types';

export type UserDocument = User & Document;

@Schema({ versionKey: false })
export class User {
  _id: ObjectId;

  @Prop({ type: String, required: true, maxlength: 200, minlength: 2 })
  full_name: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    maxlength: 50,
    minlength: 3,
  })
  username: string;

  @Prop({ type: String, required: true, maxlength: 100, minlength: 8 })
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

  @Prop({ type: String, required: true })
  created_at: string;

  @Prop({ type: String, required: false })
  updated_at: string;

  @Prop({ type: String, required: false })
  deleted_at: string;
}

const collectionName = 'USER';
export const UserSchema = SchemaFactory.createForClass(User);
export const UserModelDefinition: ModelDefinition = {
  name: User.name,
  schema: UserSchema,
  collection: collectionName,
};
model(User.name, UserSchema, collectionName);
