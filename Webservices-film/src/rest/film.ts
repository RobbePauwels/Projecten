import Router from '@koa/router';
import * as filmService from '../service/film';
import type { KoaRouter, FilmAppState, FilmAppContext} from '../types/koa';
import type{
  CreateFilmRequest,
  CreateFilmResponse,
  GetAllFilmsResponse,
  GetFilmByIdResponse,
  UpdateFilmRequest,
  UpdateFilmResponse,
} from '../types/film';
import type { IdParams } from '../types/common';
import type { KoaContext } from '../types/koa';
import validate from '../core/validation';
import Joi from 'joi';
import { requireAuthentication } from '../core/auth';

/**
 * @api {get} /film Get all films
 * @apiName GetAllFilms
 * @apiGroup Film
 *
 * @apiSuccess {Object[]} items List of films.
 * @apiSuccess {String} items.Naam The name of the film.
 * @apiSuccess {String} items.Duur The duration of the film.
 * @apiSuccess {String} items.Jaar The year of release of the film.
 * @apiSuccess {String} items.Genre The genre of the film.
 * @apiSuccess {String} items.Rating The rating of the film.
 * @apiSuccess {Object[]} items.Actors List of actors in the film.
 * @apiSuccess {String} items.Actors.Rol The role of the actor.
 */
const getAllFilms = async (ctx: KoaContext<GetAllFilmsResponse>) => {
  ctx.body = {
    items: await filmService.getAll(),
  };
};
getAllFilms.validationScheme = null;

/**
 * @api {post} /film Create a new film
 * @apiName CreateFilm
 * @apiGroup Film
 *
 * @apiParam {String} Naam The name of the film.
 * @apiParam {String} Duur The duration of the film.
 * @apiParam {String} Jaar The year of release of the film.
 * @apiParam {String} Genre The genre of the film.
 * @apiParam {String} Rating The rating of the film.
 * @apiParam {Number} [RegisseurID] The ID of the director.
 * @apiParam {Object[]} [Acteurs] List of actors in the film.
 * @apiParam {String} Acteurs.Rol The role of the actor.
 * @apiParam {Object[]} [Awards] List of awards won by the film.
 * @apiParam {String} Awards.Naam The name of the award.
 * @apiParam {String} Awards.Jaar The year the award was received.
 * @apiParam {Object[]} [Locaties] List of locations where the film was shot.
 * @apiParam {String} Locaties.Straat The street of the location.
 * @apiParam {String} Locaties.Stad The city of the location.
 * @apiParam {String} Locaties.Land The country of the location.
 *
 * @apiSuccess {Object} film The created film object.
 */

const createFilm = async (ctx: KoaContext<CreateFilmResponse, void, CreateFilmRequest>) => {
  const AddedByUserID = ctx.state.session.userId;
  const newFilm = await filmService.create(ctx.request.body,AddedByUserID);
  ctx.status = 201;
  ctx.body = newFilm;
};

createFilm.validationScheme = {
  body: {
    Naam: Joi.string().required(),
    Duur: Joi.string().required(),
    Jaar: Joi.string().required(),
    Genre: Joi.string().required(),
    Rating: Joi.string().required(),
    RegisseurID: Joi.number().integer(),
    Acteurs: Joi.array().items(
      Joi.object({
        PersoonID: Joi.number().integer().optional(),
        Rol: Joi.string().required(),
        Voornaam: Joi.string().when('PersoonID', { is: Joi.exist(), then: Joi.forbidden() }),
        Achternaam: Joi.string().when('PersoonID', { is: Joi.exist(), then: Joi.forbidden() }),
        GeboorteDatum: Joi.string().when('PersoonID', { is: Joi.exist(), then: Joi.forbidden() }),
        Land: Joi.string().when('PersoonID', { is: Joi.exist(), then: Joi.forbidden() }),
      }),
    ).optional(),
    Awards: Joi.array().items(
      Joi.object({
        Naam: Joi.string().required(),
        Jaar: Joi.string().required(),
      }),
    ).optional(),
    Locaties: Joi.array().items(
      Joi.object({
        LocatieID: Joi.number().integer().optional(),
        Straat: Joi.string().optional(),
        Stad: Joi.string().optional(),
        Land: Joi.string().optional(),
      }),
    ).optional(),
  },
};

/**
 * @api {get} /film/:id Get a film by ID
 * @apiName GetFilmById
 * @apiGroup Film
 *
 * @apiParam {Number} id The ID of the film.
 *
 * @apiSuccess {String} Naam The name of the film.
 * @apiSuccess {String} Duur The duration of the film.
 * @apiSuccess {String} Jaar The year of release.
 * @apiSuccess {String} Genre The genre of the film.
 * @apiSuccess {String} Rating The rating of the film.
 */
const getFilmById = async (ctx: KoaContext<GetFilmByIdResponse, IdParams>) => {
  ctx.body = await filmService.getFilmById(ctx.params.id);
};

getFilmById.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
};

/**
 * @api {put} /film/:id Update a film by ID
 * @apiName UpdateFilm
 * @apiGroup Film
 *
 * @apiParam {Number} id The ID of the film to update.
 * @apiParam {String} [Naam] The name of the film.
 * @apiParam {String} [Duur] The duration of the film.
 * @apiParam {String} [Jaar] The year of release of the film.
 * @apiParam {String} [Genre] The genre of the film.
 * @apiParam {String} [Rating] The rating of the film.
 * @apiParam {Number} [RegisseurID] The ID of the director.
 * @apiParam {Object[]} [Acteurs] List of actors in the film.
 * @apiParam {String} Acteurs.Rol The role of the actor.
 * @apiParam {Object[]} [Awards] List of awards won by the film.
 * @apiParam {String} Awards.Naam The name of the award.
 * @apiParam {String} Awards.Jaar The year the award was received.
 * @apiParam {Object[]} [Locaties] List of locations where the film was shot.
 * @apiParam {String} Locaties.Straat The street of the location.
 * @apiParam {String} Locaties.Stad The city of the location.
 * @apiParam {String} Locaties.Land The country of the location.
 *
 * @apiSuccess {Object} film The updated film object.
 */

const updateFilm = async (ctx: KoaContext<UpdateFilmResponse, IdParams, UpdateFilmRequest>) => {
  ctx.body = await filmService.updateById(Number(ctx.params.id), {
    ...ctx.request.body,
  }, ctx.state.session.roles);
};
updateFilm.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
  body: {
    Naam: Joi.string().optional(),
    Duur: Joi.string().optional(),
    Jaar: Joi.string().optional(),
    Genre: Joi.string().optional(),
    Rating: Joi.string().optional(),
    RegisseurID: Joi.number().integer().optional(),
    Acteurs: Joi.array().items(
      Joi.object({
        PersoonID: Joi.number().integer().optional(),
        Rol: Joi.string().required(),
        Voornaam: Joi.string().when('PersoonID', { is: Joi.exist(), then: Joi.forbidden() }),
        Achternaam: Joi.string().when('PersoonID', { is: Joi.exist(), then: Joi.forbidden() }),
        GeboorteDatum: Joi.string().when('PersoonID', { is: Joi.exist(), then: Joi.forbidden() }),
        Land: Joi.string().when('PersoonID', { is: Joi.exist(), then: Joi.forbidden() }),
      }),
    ).optional(),
    Awards: Joi.array().items(
      Joi.object({
        Naam: Joi.string().required(),
        Jaar: Joi.string().required(),
      }),
    ).optional(),
    Locaties: Joi.array().items(
      Joi.object({
        LocatieID: Joi.number().integer().optional(),
        Straat: Joi.string().optional(),
        Stad: Joi.string().optional(),
        Land: Joi.string().optional(),
      }),
    ).optional(),
  },
};

/**
 * @api {delete} /film/:id Delete a film by ID
 * @apiName DeleteFilm
 * @apiGroup Film
 *
 * @apiParam {Number} id The ID of the film to delete.
 *
 * @apiSuccess {String} message Confirmation that the film has been deleted.
 */
const deleteFilm = async (ctx: KoaContext<void, IdParams>) => {
  await filmService.deleteById(ctx.params.id, ctx.state.session.roles);
  ctx.status = 204;
};

deleteFilm.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
};

export default (parent: KoaRouter) => {
  const router = new Router<FilmAppState, FilmAppContext>({
    prefix: '/film',
  });

  router.use(requireAuthentication);

  router.get('/', validate(getAllFilms.validationScheme), getAllFilms);
  router.post('/', validate(createFilm.validationScheme), createFilm);
  router.get('/:id', validate(getFilmById.validationScheme), getFilmById);
  router.put('/:id', validate(updateFilm.validationScheme), updateFilm);
  router.delete('/:id', validate(deleteFilm.validationScheme), deleteFilm);

  parent.use(router.routes()).use(router.allowedMethods());
};
