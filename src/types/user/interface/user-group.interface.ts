import { UserDocument } from 'src/models/schemas/user.schema';
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
    full_name: string;
    username: string;
    password: string;
    role: UserRoleEnum;
    status: DefaultStatusEnum;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
  }

  export interface UpdateUserDto {
    full_name?: string;
    username?: string;
    password?: string;
    role?: UserRoleEnum;
    status?: DefaultStatusEnum;
  }

  export interface UserQuery {
    full_name?: string;
    username?: string;
    role?: UserRoleEnum;
    page?: number;
    limit?: number;
  }

  export interface UsersResponse {
    total_docs: number;
    total_page: number;
    current_page: number;
    data: UserDocument[];
  }
}
