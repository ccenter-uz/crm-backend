export enum UserRoleEnum {
  ConstructorAdmin = 'constructor-admin',
  Omanager = 'o-manager',
  Executor = 'executor',
  Operator = 'operator',
}

export enum DefaultStatusEnum {
  Active = 1,
  InActive = 0,
}

export const ErrorMessageForPassword =
  'Password too weak. Must include uppercase, lowercase, number, and special character.';

export enum PermissionMethodsEnum {
  POST = 'POST',
  GET = 'GET',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}
