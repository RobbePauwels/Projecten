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
const awardsService = __importStar(require("../service/award"));
const joi_1 = __importDefault(require("joi"));
const validation_1 = __importDefault(require("../core/validation"));
const auth_1 = require("../core/auth");
const getAllAwards = async (ctx) => {
    ctx.body = {
        items: await awardsService.getAll(),
    };
};
getAllAwards.validationScheme = null;
const getAwardByID = async (ctx) => {
    ctx.body = await awardsService.getById(Number(ctx.params.id));
};
const createAward = async (ctx) => {
    const newAward = await awardsService.create({
        ...ctx.request.body,
    });
    ctx.status = 201;
    ctx.body = newAward;
};
const deleteAward = async (ctx) => {
    await awardsService.deleteById(Number(ctx.params.id), ctx.state.session.roles);
    ctx.status = 204;
};
createAward.validationScheme = {
    body: {
        Naam: joi_1.default.string().required(),
        Jaar: joi_1.default.string().required(),
        FilmID: joi_1.default.number().integer().positive().required(),
    },
};
getAwardByID.validationScheme = {
    params: {
        id: joi_1.default.number().integer().positive().required(),
    },
};
deleteAward.validationScheme = {
    params: {
        id: joi_1.default.number().integer().positive().required(),
    },
};
exports.default = (parent) => {
    const router = new router_1.default({
        prefix: '/awards',
    });
    router.use(auth_1.requireAuthentication);
    router.get('/', (0, validation_1.default)(getAllAwards.validationScheme), getAllAwards);
    router.post('/', (0, validation_1.default)(createAward.validationScheme), createAward);
    router.get('/:id', (0, validation_1.default)(getAwardByID.validationScheme), getAwardByID);
    router.delete('/:id', (0, validation_1.default)(deleteAward.validationScheme), deleteAward);
    parent.use(router.routes()).use(router.allowedMethods());
};
