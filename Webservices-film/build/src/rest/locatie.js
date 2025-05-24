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
const locatieService = __importStar(require("../service/locatie"));
const joi_1 = __importDefault(require("joi"));
const validation_1 = __importDefault(require("../core/validation"));
const auth_1 = require("../core/auth");
const getAll = async (ctx) => {
    ctx.body = {
        items: await locatieService.getAll(),
    };
};
getAll.validationScheme = null;
const getLocatieByID = async (ctx) => {
    ctx.body = await locatieService.getById(Number(ctx.params.id));
};
const createLocatie = async (ctx) => {
    const newLocatie = await locatieService.create({
        ...ctx.request.body,
    });
    ctx.status = 201;
    ctx.body = newLocatie;
};
const deleteLocatie = async (ctx) => {
    await locatieService.deleteById(Number(ctx.params.id), ctx.state.session.roles);
    ctx.status = 204;
};
createLocatie.validationScheme = {
    body: {
        Straat: joi_1.default.string().required(),
        Stad: joi_1.default.string().required(),
        Land: joi_1.default.string().required(),
    },
};
getLocatieByID.validationScheme = {
    params: {
        id: joi_1.default.number().integer().positive().required(),
    },
};
deleteLocatie.validationScheme = {
    params: {
        id: joi_1.default.number().integer().positive().required(),
    },
};
exports.default = (parent) => {
    const router = new router_1.default({
        prefix: '/locatie',
    });
    router.use(auth_1.requireAuthentication);
    router.get('/', (0, validation_1.default)(getAll.validationScheme), getAll);
    router.post('/', (0, validation_1.default)(createLocatie.validationScheme), createLocatie);
    router.get('/:id', (0, validation_1.default)(getLocatieByID.validationScheme), getLocatieByID);
    router.delete('/:id', (0, validation_1.default)(deleteLocatie.validationScheme), deleteLocatie);
    parent.use(router.routes()).use(router.allowedMethods());
};
