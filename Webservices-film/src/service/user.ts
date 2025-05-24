import jwt from 'jsonwebtoken';
import ServiceError from '../core/serviceError';
import { prisma } from '../data';
import { hashPassword, verifyPassword } from '../core/password';
import { generateJWT, verifyJWT } from '../core/jwt';
import { getLogger } from '../core/logging';
import Role from '../core/roles';
import type { User, UserCreateInput, UserUpdateInput, PublicUser } from '../types/user';
import type { SessionInfo } from '../types/auth';
import handleDBError from './_handleDBError';

const makeExposedUser = ({ id, naam, email }: User): PublicUser => ({
  id,
  naam,
  email,
});

export const checkAndParseSession = async (
  authHeader?: string,
): Promise<SessionInfo> => {
  if (!authHeader) {
    throw ServiceError.unauthorized('You need to be signed in');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw ServiceError.unauthorized('Invalid authentication token');
  }

  const authToken = authHeader.substring(7);

  try {
    const { roles, sub } = await verifyJWT(authToken);

    return {
      userId: Number(sub),
      roles,
    };
  } catch (error: any) {
    getLogger().error(error.message, { error });

    if (error instanceof jwt.TokenExpiredError) {
      throw ServiceError.unauthorized('The token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw ServiceError.unauthorized(
        `Invalid authentication token: ${error.message}`,
      );
    } else {
      throw ServiceError.unauthorized(error.message);
    }
  }
};

export const checkRole = (role: string, roles: string[]): void => {
  const hasPermission = roles.includes(role);

  if (!hasPermission) {
    throw ServiceError.forbidden(
      'You are not allowed to view this part of the application',
    );
  }
};

export const login = async (
  email: string,
  password: string,
): Promise<string> => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // DO NOT expose we don't know the user
    throw ServiceError.unauthorized(
      'The given email and password do not match',
    );
  }

  const passwordValid = await verifyPassword(password, user.password_hash);

  if (!passwordValid) {
    // DO NOT expose we know the user but an invalid password was given
    throw ServiceError.unauthorized(
      'The given email and password do not match',
    );
  }

  return await generateJWT(user);
};

export const register = async ({
  naam,
  email,
  password,
}: UserCreateInput): Promise<string> => {
  try {
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        naam,
        email,
        password_hash: passwordHash,
        roles: [Role.USER],
      },
    });

    return await generateJWT(user);
  } catch (error) {
    throw handleDBError(error);
  }
};

export const getAll = async (): Promise<PublicUser[]> => {
  const users = await prisma.user.findMany();
  return users.map(makeExposedUser);
};

export const getById = async (id: number): Promise<PublicUser> => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw ServiceError.notFound('No user with this id exists');
  }

  return makeExposedUser(user);
};

export const updateById = async (id: number, changes: UserUpdateInput): Promise<PublicUser> => {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: changes,
    });
    return makeExposedUser(user);
  } catch (error) {
    throw handleDBError(error);
  }
};

export const deleteById = async (id: number,roles:string[]): Promise<void> => {
  if(!roles.includes(Role.ADMIN)){
    throw ServiceError.forbidden('You are not allowed to do this action');
  }
  
  try {
    await prisma.user.delete({ where: { id } });
  } catch (error) {
    throw handleDBError(error);
  }
};
