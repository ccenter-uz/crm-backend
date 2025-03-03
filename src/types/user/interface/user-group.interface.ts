import { DefaultStatusEnum, UserRoleEnum } from 'src/types/global';

export namespace UserInterfaces {
  export interface LogInRequest {
    username: string;
    password: string;
  }

  export interface LogInResponse {
    accessToken: string;
    permissions: any;
    user: any; // need to change when create RESPONSE
  }

  export interface CreateUserDto {
    fullName: string;
    username: string;
    password: string;
    role: UserRoleEnum;
    status: DefaultStatusEnum;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
  }

  export interface UpdateUserDto {
    fullName?: string;
    username?: string;
    password?: string;
    role?: UserRoleEnum;
    status?: DefaultStatusEnum;
  }

  export interface UserResponse {
    id: string;
    username: string;
    fullName: string;
    role: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }
}
