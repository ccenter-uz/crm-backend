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
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
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
    full_name: string;
    role: string;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
  }
}
