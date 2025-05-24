// src/rest/health.ts
import Router from '@koa/router';
import * as healthService from '../service/health';
import type { KoaContext,KoaRouter, FilmAppState, FilmAppContext} from '../types/koa';
import type { PingResponse, VersionResponse } from '../types/health';
import validate from '../core/validation';

/**
 * @api {get} api/health/ping Check if the service is running
 * @apiName Ping
 * @apiGroup Health
 *
 * @apiSuccess {String} message A success message indicating the service is up.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Service is up and running"
 *     }
 */
const ping = async (ctx: KoaContext<PingResponse>) => {
  ctx.status = 200;
  ctx.body = healthService.ping();
};
ping.validationScheme = null;
/**
 * @api {get} api/health/version Get the current version of the service
 * @apiName GetVersion
 * @apiGroup Health
 *
 * @apiSuccess {String} version The version of the service.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "version": "1.0.0"
 *     }
 */
const getVersion = async (ctx: KoaContext<VersionResponse>) => {
  ctx.status = 200;
  ctx.body = healthService.getVersion();
};
getVersion.validationScheme = null;
export default (parent: KoaRouter) => {
  const router = new Router<FilmAppState, FilmAppContext>({ prefix: '/health' });

  router.get('/ping', validate(ping.validationScheme), ping);
  router.get('/version', validate(getVersion.validationScheme), getVersion);

  parent.use(router.routes()).use(router.allowedMethods());
};
