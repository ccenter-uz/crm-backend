import { DefaultStatusEnum, UserRoleEnum } from './constants';

export type UserRoleType =
  | UserRoleEnum.ConstructorAdmin
  | UserRoleEnum.Omanager
  | UserRoleEnum.Executor
  | UserRoleEnum.Operator;

export type DefaultStatusType =
  | DefaultStatusEnum.Active
  | DefaultStatusEnum.InActive;
