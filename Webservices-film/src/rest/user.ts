import type { Next } from 'koa';
import Router from '@koa/router';
import Joi from 'joi';
import * as userService from '../service/user';
import type { FilmAppState, FilmAppContext} from '../types/koa';
import type { KoaContext, KoaRouter } from '../types/koa';
import type {
  RegisterUserRequest,
  GetAllUsersResponse,
  GetUserByIdResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  LoginResponse,
  GetUserRequest,
} from '../types/user';
import type { IdParams } from '../types/common';
import validate from '../core/validation';
import { requireAuthentication, makeRequireRole, authDelay } from '../core/auth';
import Role from '../core/roles';

const checkUserId = (ctx: KoaContext<unknown, GetUserRequest>, next: Next) => {
  const { userId, roles } = ctx.state.session;
  const { id } = ctx.params;

  // You can only get our own data unless you're an admin
  if (id !== 'me' && id !== userId && !roles.includes(Role.ADMIN)) {
    return ctx.throw(
      403,
      'You are not allowed to view this part of the application',
      { code: 'FORBIDDEN' },
    );
  }
  return next();
};
/**
 * @api {get} api/users Get All Users
 * @apinaam GetAllUsers
 * @apiGroup Users
 * @apiPermission admin
 *
 * @apiSuccess {Object[]} items List of users.
 * @apiSuccess {Number} items.id ID of the user.
 * @apiSuccess {String} items.naam naam of the user.
 * @apiSuccess {String} items.email Email of the user.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "items": [
 *     { "id": 1, "naam": "John Doe", "email": "john.doe@example.com" },
 *     { "id": 2, "naam": "Jane Smith", "email": "jane.smith@example.com" }
 *   ]
 * }
 */
const getAllUsers = async (ctx: KoaContext<GetAllUsersResponse>) => {
  const users = await userService.getAll();
  ctx.body = { items: users };
};
getAllUsers.validationScheme = null;

/**
 * @api {post} api/users Register a new User
 * @apinaam RegisterUser
 * @apiGroup Users
 * @apiPermission none
 *
 * @apiBody {String} naam naam of the user.
 * @apiBody {String} email Email address of the user.
 * @apiBody {String} password Password for the user.
 *
 * @apiSuccess {String} token JWT token for the authenticated user.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "token": "jwt-token-string"
 * }
 *
 * @apiError {String} message Validation error.
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "message": "Validation error",
 *   "details": {
 *     "body": { "naam": "naam is required" }
 *   }
 * }
 */
const registerUser = async (ctx: KoaContext<LoginResponse, void, RegisterUserRequest>) => {
  const token = await userService.register(ctx.request.body);
  ctx.status = 200;
  ctx.body = { token };
};
registerUser.validationScheme = {
  body: {
    naam: Joi.string().max(255),
    email: Joi.string().email(),
    password: Joi.string().min(12).max(128),
  },
};

/**
 * @api {get} api/users/:id Get User by ID
 * @apinaam GetUserById
 * @apiGroup Users
 * @apiPermission authenticated
 *
 * @apiParam {Number=me} id User ID or 'me' for the current logged-in user.
 *
 * @apiSuccess {Number} id ID of the user.
 * @apiSuccess {String} naam naam of the user.
 * @apiSuccess {String} email Email of the user.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "id": 1,
 *   "naam": "John Doe",
 *   "email": "john.doe@example.com"
 * }
 *
 * @apiError {String} message User not found or permission denied.
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 403 Forbidden
 * {
 *   "message": "You are not allowed to view this user\'s information"
 * }
 */
const getUserById = async (ctx: KoaContext<GetUserByIdResponse, GetUserRequest>) => {
  const user = await userService.getById(
    ctx.params.id === 'me' ? ctx.state.session.userId : ctx.params.id,
  );
  ctx.status = 200;
  ctx.body = user;
};
getUserById.validationScheme = {
  params: {
    id: Joi.alternatives().try(
      Joi.number().integer().positive(),
      Joi.string().valid('me'),
    ),
  },
};

/**
 * @api {put} api/users/:id Update User by ID
 * @apinaam UpdateUser
 * @apiGroup Users
 * @apiPermission authenticated
 *
 * @apiParam {Number} id ID of the user to update.
 * @apiBody {String} naam naam of the user.
 * @apiBody {String} email Email address of the user.
 *
 * @apiSuccess {Number} id ID of the updated user.
 * @apiSuccess {String} naam naam of the user.
 * @apiSuccess {String} email Email of the user.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "id": 1,
 *   "naam": "John Updated",
 *   "email": "john.updated@example.com"
 * }
 *
 * @apiError {String} message User not found.
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   "message": "User not found"
 * }
 */
const updateUserById = async (ctx: KoaContext<UpdateUserResponse, IdParams, UpdateUserRequest>) => {
  const user = await userService.updateById(ctx.params.id, ctx.request.body);
  ctx.status = 200;
  ctx.body = user;
};
updateUserById.validationScheme = {
  params: { id: Joi.number().integer().positive() },
  body: {
    naam: Joi.string().max(255),
    email: Joi.string().email(),
  },
};

/**
 * @api {delete} api/users/:id Delete User by ID
 * @apinaam DeleteUser
 * @apiGroup Users
 * @apiPermission authenticated
 *
 * @apiParam {Number} id ID of the user to delete.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 204 No Content
 *
 * @apiError {String} message User not found or permission denied.
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 403 Forbidden
 * {
 *   "message": "You are not allowed to delete this user"
 * }
 */
const deleteUserById = async (ctx: KoaContext<void, IdParams>) => {
  await userService.deleteById(ctx.params.id,ctx.state.session.roles);
  ctx.status = 204;
};
deleteUserById.validationScheme = {
  params: {
    id: Joi.number().integer().positive(),
  },
};

export default (parent: KoaRouter) => {
  const router = new Router<FilmAppState, FilmAppContext>({ prefix: '/users' });

  router.post(
    '/',
    authDelay,
    validate(registerUser.validationScheme),
    registerUser,
  );

  const requireAdmin = makeRequireRole(Role.ADMIN);

  router.get(
    '/',
    requireAuthentication,
    requireAdmin,
    validate(getAllUsers.validationScheme),
    getAllUsers,
  );
  router.get(
    '/:id',
    requireAuthentication,
    validate(getUserById.validationScheme),
    checkUserId,
    getUserById,
  );
  router.put(
    '/:id',
    requireAuthentication,
    validate(updateUserById.validationScheme),
    checkUserId,
    updateUserById,
  );
  router.delete(
    '/:id',
    requireAuthentication,
    requireAdmin,
    validate(deleteUserById.validationScheme),
    checkUserId,
    deleteUserById,
  );

  parent
    .use(router.routes())
    .use(router.allowedMethods());
};
