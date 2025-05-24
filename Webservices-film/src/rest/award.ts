import Router from '@koa/router';
import * as awardsService from '../service/award';
import type { KoaRouter, FilmAppState, FilmAppContext } from '../types/koa';
import type { CreateAwardRequest, CreateAwardResponse, GetAllAwardsResponse, GetAwardByIdResponse } 
  from '../types/award';
import type { IdParams } from '../types/common';
import type { KoaContext } from '../types/koa';
import Joi from 'joi';
import validate from '../core/validation';
import { requireAuthentication } from '../core/auth';

/**
 * @api {get} /awards Get All Awards
 * @apiName GetAllAwards
 * @apiGroup Awards
 * @apiPermission authenticated
 *
 * @apiSuccess {Object[]} items List of awards.
 * @apiSuccess {Number} items.id ID of the award.
 * @apiSuccess {String} items.Naam Name of the award.
 * @apiSuccess {String} items.Jaar Year of the award.
 * @apiSuccess {Number} items.FilmID ID of the associated film.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "items": [
 *     { "id": 1, "Naam": "Oscar", "Jaar": "2023", "FilmID": 10 },
 *     { "id": 2, "Naam": "Golden Globe", "Jaar": "2022", "FilmID": 12 }
 *   ]
 * }
 */
const getAllAwards = async (ctx: KoaContext<GetAllAwardsResponse>) => {
  ctx.body = {
    items: await awardsService.getAll(),
  };
};
getAllAwards.validationScheme = null;

/**
 * @api {get} /awards/:id Get Award by ID
 * @apiName GetAwardByID
 * @apiGroup Awards
 * @apiPermission authenticated
 *
 * @apiParam {Number} id Award ID.
 *
 * @apiSuccess {Number} id ID of the award.
 * @apiSuccess {String} Naam Name of the award.
 * @apiSuccess {String} Jaar Year of the award.
 * @apiSuccess {Number} FilmID ID of the associated film.
 *
 * @apiError {String} message Award not found.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "id": 1,
 *   "Naam": "Oscar",
 *   "Jaar": "2023",
 *   "FilmID": 10
 * }
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   "message": "Award not found"
 * }
 */
const getAwardByID = async (ctx: KoaContext<GetAwardByIdResponse, IdParams>) => {
  ctx.body = await awardsService.getById(Number(ctx.params.id));
};

/**
 * @api {post} /awards Create a New Award
 * @apiName CreateAward
 * @apiGroup Awards
 * @apiPermission authenticated
 *
 * @apiBody {String} Naam Name of the award.
 * @apiBody {String} Jaar Year of the award.
 * @apiBody {Number} FilmID ID of the associated film.
 *
 * @apiSuccess {Number} id ID of the created award.
 * @apiSuccess {String} Naam Name of the award.
 * @apiSuccess {String} Jaar Year of the award.
 * @apiSuccess {Number} FilmID ID of the associated film.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 201 Created
 * {
 *   "id": 3,
 *   "Naam": "BAFTA",
 *   "Jaar": "2021",
 *   "FilmID": 15
 * }
 *
 * @apiError {String} message Validation error.
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "message": "Validation error",
 *   "details": {
 *     "body": { "Naam": "Naam is required" }
 *   }
 * }
 */
const createAward = async (ctx: KoaContext<CreateAwardResponse, void, CreateAwardRequest>) => {
  const newAward = await awardsService.create({
    ...ctx.request.body,
  });
  ctx.status = 201;
  ctx.body = newAward;
};

/**
 * @api {delete} /awards/:id Delete an Award
 * @apiName DeleteAward
 * @apiGroup Awards
 * @apiPermission authenticated admin
 *
 * @apiParam {Number} id Award ID.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 204 No Content
 *
 * @apiError {String} message Award not found or permission denied.
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   "message": "Award not found"
 * }
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 403 Forbidden
 * {
 *   "message": "Permission denied"
 * }
 */
const deleteAward = async (ctx: KoaContext<void, IdParams>) => {
  await awardsService.deleteById(Number(ctx.params.id), ctx.state.session.roles);
  ctx.status = 204;
};

createAward.validationScheme = {
  body: {
    Naam: Joi.string().required(),
    Jaar: Joi.string().required(),
    FilmID: Joi.number().integer().positive().required(),
  },
};

getAwardByID.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
};

deleteAward.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
};

export default (parent: KoaRouter) => {
  const router = new Router<FilmAppState, FilmAppContext>({
    prefix: '/awards',
  });

  router.use(requireAuthentication);

  router.get('/', validate(getAllAwards.validationScheme), getAllAwards);
  router.post('/', validate(createAward.validationScheme), createAward);
  router.get('/:id', validate(getAwardByID.validationScheme), getAwardByID);
  router.delete('/:id', validate(deleteAward.validationScheme), deleteAward);

  parent.use(router.routes()).use(router.allowedMethods());
};
