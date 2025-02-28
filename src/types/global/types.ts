import {
  DefaultStatusEnum,
  PermissionMethodsEnum,
  UserRoleEnum,
} from './constants';

export type UserRoleType =
  | UserRoleEnum.ConstructorAdmin
  | UserRoleEnum.Omanager
  | UserRoleEnum.Executor
  | UserRoleEnum.Operator;

export type DefaultStatusType =
  | DefaultStatusEnum.Active
  | DefaultStatusEnum.InActive;

export type PermissionsType = {
  method: PermissionMethodsType;
  path: string;
  status: DefaultStatusType;
};

export type PermissionMethodsType =
  | PermissionMethodsEnum.GET
  | PermissionMethodsEnum.POST
  | PermissionMethodsEnum.PUT
  | PermissionMethodsEnum.PATCH
  | PermissionMethodsEnum.DELETE;
