import type { Prisma } from '@prisma/client';
import type { ListResponse } from './common';

export interface User  {
  id: number;
  naam: string;
  email: string;
  password_hash: string;
  roles: Prisma.JsonValue;
}

export interface UserCreateInput {
  naam: string;
  email: string;
  password: string;
}

export interface PublicUser extends Pick<User, 'id' | 'naam' | 'email'> {}

export interface UserUpdateInput extends Pick<UserCreateInput, 'naam' | 'email'> {}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GetUserRequest {
  id: number | 'me';
}
export interface RegisterUserRequest {
  naam: string;
  email: string;
  password: string;
}
export interface UpdateUserRequest extends Pick<RegisterUserRequest, 'naam' | 'email'> {}

export interface GetAllUsersResponse extends ListResponse<PublicUser> {}
export interface GetUserByIdResponse extends PublicUser {}
export interface UpdateUserResponse extends GetUserByIdResponse {}

export interface LoginResponse {
  token: string;
}
