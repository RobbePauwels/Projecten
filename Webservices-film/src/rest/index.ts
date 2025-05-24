// src/rest/index.ts
import Router from '@koa/router';
import installFilmRouter from './film';
import installHealthRouter from './health';
import installPersoonRouter from './persoon';
import installLocatieRouter from './locatie';
import installAwardRouter from './award';
import installUserRouter from './user';
import installSessionRouter from './session';
import type {
  FilmAppState, FilmAppContext,
  KoaApplication,
} from '../types/koa';

/**
 * @api {get} /api/ Health check endpoint
 * @apiName HealthCheck
 * @apiGroup API
 *
 * @apiSuccess {String} message A success message indicating the API is up.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "API is running"
 *     }
 */

/**
 * @api {get} /api/films Retrieve all films
 * @apiName GetAllFilms
 * @apiGroup API
 *
 * @apiSuccess {Object[]} films List of all films in the database.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "films": [
 *         {
 *           "id": 1,
 *           "name": "Inception",
 *           "director": "Christopher Nolan",
 *           "year": 2010
 *         },
 *         {
 *           "id": 2,
 *           "name": "The Dark Knight",
 *           "director": "Christopher Nolan",
 *           "year": 2008
 *         }
 *       ]
 *     }
 */

/**
 * @api {get} /api/health/ping Ping the API for service status
 * @apiName PingService
 * @apiGroup Health
 *
 * @apiSuccess {String} message A success message indicating the service is up.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Service is up and running"
 *     }
 */

/**
 * @api {get} /api/health/version Get the current version of the API
 * @apiName GetVersion
 * @apiGroup Health
 *
 * @apiSuccess {String} version The current version of the API.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "version": "1.0.0"
 *     }
 */

export default (app: KoaApplication) => {
  const router = new Router<FilmAppState, FilmAppContext>({
    prefix: '/api',
  });

  installFilmRouter(router); // Install routes for the "film" resource
  installHealthRouter(router); // Install routes for the "health" check
  installPersoonRouter(router); // Install routes for the "persoon" resource
  installLocatieRouter(router); // Install routes for the "locatie" resource
  installAwardRouter(router); // Install routes for the "award" resource
  installUserRouter(router); // Install routes for the "user" resource
  installSessionRouter(router); // Install routes for the "session" management

  app.use(router.routes()).use(router.allowedMethods());
};
