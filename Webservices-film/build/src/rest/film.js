"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = __importDefault(require("@koa/router"));
const filmService = __importStar(require("../service/film"));
const validation_1 = __importDefault(require("../core/validation"));
const joi_1 = __importDefault(require("joi"));
const auth_1 = require("../core/auth");
const getAllFilms = async (ctx) => {
    ctx.body = {
        items: await filmService.getAll(),
    };
};
getAllFilms.validationScheme = null;
const createFilm = async (ctx) => {
    const newFilm = await filmService.create(ctx.request.body);
    ctx.status = 201;
    ctx.body = newFilm;
};
createFilm.validationScheme = {
    body: {
        Naam: joi_1.default.string().required(),
        Duur: joi_1.default.string().required(),
        Jaar: joi_1.default.string().required(),
        Genre: joi_1.default.string().required(),
        Rating: joi_1.default.string().required(),
        RegisseurID: joi_1.default.number().integer(),
        Acteurs: joi_1.default.array().items(joi_1.default.object({
            PersoonID: joi_1.default.number().integer().optional(),
            Rol: joi_1.default.string().required(),
            Voornaam: joi_1.default.string().when('PersoonID', { is: joi_1.default.exist(), then: joi_1.default.forbidden() }),
            Achternaam: joi_1.default.string().when('PersoonID', { is: joi_1.default.exist(), then: joi_1.default.forbidden() }),
            GeboorteDatum: joi_1.default.string().when('PersoonID', { is: joi_1.default.exist(), then: joi_1.default.forbidden() }),
            Land: joi_1.default.string().when('PersoonID', { is: joi_1.default.exist(), then: joi_1.default.forbidden() }),
        })).optional(),
        Awards: joi_1.default.array().items(joi_1.default.object({
            Naam: joi_1.default.string().required(),
            Jaar: joi_1.default.string().required(),
        })).optional(),
        Locaties: joi_1.default.array().items(joi_1.default.object({
            LocatieID: joi_1.default.number().integer().optional(),
            Straat: joi_1.default.string().optional(),
            Stad: joi_1.default.string().optional(),
            Land: joi_1.default.string().optional(),
        })).optional(),
    },
};
const getFilmById = async (ctx) => {
    ctx.body = await filmService.getFilmById(ctx.params.id);
};
getFilmById.validationScheme = {
    params: {
        id: joi_1.default.number().integer().positive().required(),
    },
};
const updateFilm = async (ctx) => {
    ctx.body = await filmService.updateById(Number(ctx.params.id), {
        ...ctx.request.body,
    }, ctx.state.session.roles);
};
updateFilm.validationScheme = {
    params: {
        id: joi_1.default.number().integer().positive().required(),
    },
    body: {
        Naam: joi_1.default.string().optional(),
        Duur: joi_1.default.string().optional(),
        Jaar: joi_1.default.string().optional(),
        Genre: joi_1.default.string().optional(),
        Rating: joi_1.default.string().optional(),
        RegisseurID: joi_1.default.number().integer().optional(),
        Acteurs: joi_1.default.array().items(joi_1.default.object({
            PersoonID: joi_1.default.number().integer().optional(),
            Rol: joi_1.default.string().required(),
            Voornaam: joi_1.default.string().when('PersoonID', { is: joi_1.default.exist(), then: joi_1.default.forbidden() }),
            Achternaam: joi_1.default.string().when('PersoonID', { is: joi_1.default.exist(), then: joi_1.default.forbidden() }),
            GeboorteDatum: joi_1.default.string().when('PersoonID', { is: joi_1.default.exist(), then: joi_1.default.forbidden() }),
            Land: joi_1.default.string().when('PersoonID', { is: joi_1.default.exist(), then: joi_1.default.forbidden() }),
        })).optional(),
        Awards: joi_1.default.array().items(joi_1.default.object({
            Naam: joi_1.default.string().required(),
            Jaar: joi_1.default.string().required(),
        })).optional(),
        Locaties: joi_1.default.array().items(joi_1.default.object({
            LocatieID: joi_1.default.number().integer().optional(),
            Straat: joi_1.default.string().optional(),
            Stad: joi_1.default.string().optional(),
            Land: joi_1.default.string().optional(),
        })).optional(),
    },
};
const deleteFilm = async (ctx) => {
    await filmService.deleteById(ctx.params.id, ctx.state.session.roles);
    ctx.status = 204;
};
deleteFilm.validationScheme = {
    params: {
        id: joi_1.default.number().integer().positive().required(),
    },
};
exports.default = (parent) => {
    const router = new router_1.default({
        prefix: '/film',
    });
    router.use(auth_1.requireAuthentication);
    router.get('/', (0, validation_1.default)(getAllFilms.validationScheme), getAllFilms);
    router.post('/', (0, validation_1.default)(createFilm.validationScheme), createFilm);
    router.get('/:id', (0, validation_1.default)(getFilmById.validationScheme), getFilmById);
    router.put('/:id', (0, validation_1.default)(updateFilm.validationScheme), updateFilm);
    router.delete('/:id', (0, validation_1.default)(deleteFilm.validationScheme), deleteFilm);
    parent.use(router.routes()).use(router.allowedMethods());
};
