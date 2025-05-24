// src/rest/locatie.ts
import Router from '@koa/router';
import * as locatieService from '../service/locatie';
import type { KoaRouter, FilmAppState, FilmAppContext } from '../types/koa';
import type {
  CreateLocatieRequest,
  CreateLocatieResponse,
  GetAllLocatiesResponse,
  GetLocatieByIdResponse,
} from '../types/Locatie';
import type { IdParams } from '../types/common';
import type { KoaContext } from '../types/koa';
import Joi from 'joi';
import validate from '../core/validation';
import { requireAuthentication } from '../core/auth';

/**
 * @api {get} /api/locatie Retrieve all locaties
 * @apiName GetAllLocaties
 * @apiGroup Locatie
 *
 * @apiSuccess {Object[]} items List of all locaties in the database.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "items": [
 *         {
 *           "id": 1,
 *           "straat": "Main Street",
 *           "stad": "Amsterdam",
 *           "land": "Netherlands"
 *         },
 *         {
 *           "id": 2,
 *           "straat": "Highway 1",
 *           "stad": "Brussels",
 *           "land": "Belgium"
 *         }
 *       ]
 *     }
 */

/**
 * @api {get} /api/locatie/:id Retrieve a locatie by ID
 * @apiName GetLocatieById
 * @apiGroup Locatie
 * @apiParam {Number} id Locatie unique ID.
 *
 * @apiSuccess {Number} id Unique ID of the locatie.
 * @apiSuccess {String} straat Street name of the locatie.
 * @apiSuccess {String} stad City name of the locatie.
 * @apiSuccess {String} land Country name of the locatie.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 1,
 *       "straat": "Main Street",
 *       "stad": "Amsterdam",
 *       "land": "Netherlands"
 *     }
 */

/**
 * @api {post} /api/locatie Create a new locatie
 * @apiName CreateLocatie
 * @apiGroup Locatie
 *
 * @apiParam {String} straat Street name of the locatie.
 * @apiParam {String} stad City name of the locatie.
 * @apiParam {String} land Country name of the locatie.
 *
 * @apiSuccess {Number} id Unique ID of the newly created locatie.
 * @apiSuccess {String} straat Street name of the new locatie.
 * @apiSuccess {String} stad City name of the new locatie.
 * @apiSuccess {String} land Country name of the new locatie.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "id": 3,
 *       "straat": "Baker Street",
 *       "stad": "London",
 *       "land": "United Kingdom"
 *     }
 */

/**
 * @api {delete} /api/locatie/:id Delete a locatie by ID
 * @apiName DeleteLocatie
 * @apiGroup Locatie
 * @apiParam {Number} id Locatie unique ID.
 *
 * @apiSuccess {String} message Confirmation message that the locatie has been deleted.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 */

/**
 * @api {get} /api/locatie/ping Ping the API for service status
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

const getAll = async (ctx: KoaContext<GetAllLocatiesResponse>) => {
  ctx.body = {
    items: await locatieService.getAll(),
  };
};
getAll.validationScheme = null;

const getLocatieByID = async (ctx: KoaContext<GetLocatieByIdResponse, IdParams>) => {
  ctx.body = await locatieService.getById(Number(ctx.params.id));
};

const createLocatie = async (ctx: KoaContext<CreateLocatieResponse, void, CreateLocatieRequest>) => {
  const newLocatie = await locatieService.create({
    ...ctx.request.body,
  });
  ctx.status = 201;
  ctx.body = newLocatie;
};

const deleteLocatie = async (ctx: KoaContext<void, IdParams>) => {
  await locatieService.deleteById(Number(ctx.params.id), ctx.state.session.roles);
  ctx.status = 204;
};

createLocatie.validationScheme = {
  body: {
    Straat: Joi.string().required(),
    Stad: Joi.string().required(),
    Land: Joi.string().required(),
  },
};

getLocatieByID.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
};

deleteLocatie.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
};

export default (parent: KoaRouter) => {
  const router = new Router<FilmAppState, FilmAppContext>({
    prefix: '/locatie',
  });

  router.use(requireAuthentication);

  router.get('/', validate(getAll.validationScheme), getAll);
  router.post('/', validate(createLocatie.validationScheme), createLocatie);
  router.get('/:id', validate(getLocatieByID.validationScheme), getLocatieByID);
  router.delete('/:id', validate(deleteLocatie.validationScheme), deleteLocatie);

  parent.use(router.routes()).use(router.allowedMethods());
};
