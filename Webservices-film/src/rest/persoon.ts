// src/rest/persoon.ts
import Router from '@koa/router';
import * as persoonService from '../service/persoon';
import type { KoaRouter, FilmAppState, FilmAppContext } from '../types/koa';
import type {
  CreatePersoonRequest,
  CreatePersoonResponse,
  GetAllPersonenResponse,
  GetPersoonByIdResponse,
} from '../types/persoon';
import type { IdParams } from '../types/common';
import type { KoaContext } from '../types/koa';
import Joi from 'joi';
import validate from '../core/validation';
import { requireAuthentication } from '../core/auth';

/**
 * @api {get} /api/persoon Retrieve all personen
 * @apiName GetAllPersonen
 * @apiGroup Persoon
 *
 * @apiSuccess {Object[]} items List of all personen in the database.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "items": [
 *         {
 *           "id": 1,
 *           "voornaam": "John",
 *           "achternaam": "Doe",
 *           "geboorteDatum": "1985-06-15",
 *           "land": "Netherlands"
 *         },
 *         {
 *           "id": 2,
 *           "voornaam": "Jane",
 *           "achternaam": "Smith",
 *           "geboorteDatum": "1990-02-20",
 *           "land": "Belgium"
 *         }
 *       ]
 *     }
 */

/**
 * @api {get} /api/persoon/:id Retrieve a persoon by ID
 * @apiName GetPersoonById
 * @apiGroup Persoon
 * @apiParam {Number} id Persoon unique ID.
 *
 * @apiSuccess {Number} id Unique ID of the persoon.
 * @apiSuccess {String} voornaam First name of the persoon.
 * @apiSuccess {String} achternaam Last name of the persoon.
 * @apiSuccess {String} geboorteDatum Birth date of the persoon.
 * @apiSuccess {String} land Country of the persoon.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 1,
 *       "voornaam": "John",
 *       "achternaam": "Doe",
 *       "geboorteDatum": "1985-06-15",
 *       "land": "Netherlands"
 *     }
 */

/**
 * @api {post} /api/persoon Create a new persoon
 * @apiName CreatePersoon
 * @apiGroup Persoon
 *
 * @apiParam {String} voornaam First name of the persoon.
 * @apiParam {String} achternaam Last name of the persoon.
 * @apiParam {String} geboorteDatum Birth date of the persoon (in YYYY-MM-DD format).
 * @apiParam {String} land Country of the persoon.
 *
 * @apiSuccess {Number} id Unique ID of the newly created persoon.
 * @apiSuccess {String} voornaam First name of the new persoon.
 * @apiSuccess {String} achternaam Last name of the new persoon.
 * @apiSuccess {String} geboorteDatum Birth date of the new persoon.
 * @apiSuccess {String} land Country of the new persoon.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "id": 3,
 *       "voornaam": "Alice",
 *       "achternaam": "Johnson",
 *       "geboorteDatum": "1992-12-11",
 *       "land": "USA"
 *     }
 */

/**
 * @api {delete} /api/persoon/:id Delete a persoon by ID
 * @apiName DeletePersoon
 * @apiGroup Persoon
 * @apiParam {Number} id Persoon unique ID.
 *
 * @apiSuccess {String} message Confirmation message that the persoon has been deleted.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 */

const getAllPersonen = async (ctx: KoaContext<GetAllPersonenResponse>) => {
  ctx.body = {
    items: await persoonService.getAll(),
  };
};
getAllPersonen.validationScheme = null;

const getPersoonByID = async (ctx: KoaContext<GetPersoonByIdResponse, IdParams>) => {
  ctx.body = await persoonService.getById(Number(ctx.params.id));
};

const createPersoon = async (ctx: KoaContext<CreatePersoonResponse, void, CreatePersoonRequest>) => {
  const newPersoon = await persoonService.create({
    ...ctx.request.body,
  });
  ctx.status = 201;
  ctx.body = newPersoon;
};

const deletePersoon = async (ctx: KoaContext<void, IdParams>) => {
  await persoonService.deleteById(Number(ctx.params.id), ctx.state.session.roles);
  ctx.status = 204;
};

createPersoon.validationScheme = {
  body: {
    Voornaam: Joi.string().required(),
    Achternaam: Joi.string().required(),
    GeboorteDatum: Joi.string().required(),
    Land: Joi.string().required(),
  },
};

getPersoonByID.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
};

deletePersoon.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
};

export default (parent: KoaRouter) => {
  const router = new Router<FilmAppState, FilmAppContext>({
    prefix: '/persoon',
  });

  router.use(requireAuthentication);

  router.get('/', validate(getAllPersonen.validationScheme), getAllPersonen);
  router.post('/', validate(createPersoon.validationScheme), createPersoon);
  router.get('/:id', validate(getPersoonByID.validationScheme), getPersoonByID);
  router.delete('/:id', validate(deletePersoon.validationScheme), deletePersoon);

  parent.use(router.routes()).use(router.allowedMethods());
};
