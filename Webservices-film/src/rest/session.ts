// src/rest/session.ts
import Router from '@koa/router';
import Joi from 'joi';
import validate from '../core/validation';
import * as userService from '../service/user';
import { authDelay } from '../core/auth';
import type {
  KoaContext,
  KoaRouter,
  FilmAppContext,
  FilmAppState,
} from '../types/koa';
import type {
  LoginResponse,
  LoginRequest,
} from '../types/user';

/**
 * @api {post} /api/sessions Login a user
 * @apiName LoginUser
 * @apiGroup Session
 *
 * @apiParam {String} email The user's email address.
 * @apiParam {String} password The user's password.
 *
 * @apiSuccess {String} token JWT token to authenticate further requests.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODk
 *                IiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.CyH8MIEPqf2ehtOIsfT9pTLiRuRlno4eJhFHkbH5rJo"
 *     }
 *
 * @apiError (Error 400) {String} error "Invalid email or password"
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Invalid email or password"
 *     }
 */

/**
 * @api {post} /api/sessions Logout a user
 * @apiName LogoutUser
 * @apiGroup Session
 *
 * @apiSuccess {String} message "Logged out successfully."
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Logged out successfully."
 *     }
 */

const login = async (ctx: KoaContext<LoginResponse, void, LoginRequest>) => {
  const { email, password } = ctx.request.body;
  const token = await userService.login(email, password);

  ctx.status = 200;
  ctx.body = { token };
};
login.validationScheme = {
  body: {
    email: Joi.string().email(),
    password: Joi.string(),
  },
};

export default function installSessionRoutes(parent: KoaRouter) {
  const router = new Router<FilmAppState, FilmAppContext>({
    prefix: '/sessions',
  });

  router.post(
    '/',
    authDelay,
    validate(login.validationScheme),
    login,
  );

  parent.use(router.routes()).use(router.allowedMethods());
}
