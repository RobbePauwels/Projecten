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
const joi_1 = __importDefault(require("joi"));
const userService = __importStar(require("../service/user"));
const validation_1 = __importDefault(require("../core/validation"));
const auth_1 = require("../core/auth");
const roles_1 = __importDefault(require("../core/roles"));
const checkUserId = (ctx, next) => {
    const { userId, roles } = ctx.state.session;
    const { id } = ctx.params;
    if (id !== 'me' && id !== userId && !roles.includes(roles_1.default.ADMIN)) {
        return ctx.throw(403, 'You are not allowed to view this user\'s information', { code: 'FORBIDDEN' });
    }
    return next();
};
const getAllUsers = async (ctx) => {
    const users = await userService.getAll();
    ctx.body = { items: users };
};
getAllUsers.validationScheme = null;
const registerUser = async (ctx) => {
    const token = await userService.register(ctx.request.body);
    ctx.status = 200;
    ctx.body = { token };
};
registerUser.validationScheme = {
    body: {
        name: joi_1.default.string().max(255),
        email: joi_1.default.string().email(),
        password: joi_1.default.string().min(12).max(128),
    },
};
const getUserById = async (ctx) => {
    const user = await userService.getById(ctx.params.id === 'me' ? ctx.state.session.userId : ctx.params.id);
    ctx.status = 200;
    ctx.body = user;
};
getUserById.validationScheme = {
    params: {
        id: joi_1.default.alternatives().try(joi_1.default.number().integer().positive(), joi_1.default.string().valid('me')),
    },
};
const updateUserById = async (ctx) => {
    const user = await userService.updateById(ctx.params.id, ctx.request.body);
    ctx.status = 200;
    ctx.body = user;
};
updateUserById.validationScheme = {
    params: { id: joi_1.default.number().integer().positive() },
    body: {
        name: joi_1.default.string().max(255),
        email: joi_1.default.string().email(),
    },
};
const deleteUserById = async (ctx) => {
    await userService.deleteById(ctx.params.id);
    ctx.status = 204;
};
deleteUserById.validationScheme = {
    params: {
        id: joi_1.default.number().integer().positive(),
    },
};
exports.default = (parent) => {
    const router = new router_1.default({ prefix: '/users' });
    router.post('/', auth_1.authDelay, (0, validation_1.default)(registerUser.validationScheme), registerUser);
    const requireAdmin = (0, auth_1.makeRequireRole)(roles_1.default.ADMIN);
    router.get('/', auth_1.requireAuthentication, requireAdmin, (0, validation_1.default)(getAllUsers.validationScheme), getAllUsers);
    router.get('/:id', auth_1.requireAuthentication, (0, validation_1.default)(getUserById.validationScheme), checkUserId, getUserById);
    router.put('/:id', auth_1.requireAuthentication, (0, validation_1.default)(updateUserById.validationScheme), checkUserId, updateUserById);
    router.delete('/:id', auth_1.requireAuthentication, (0, validation_1.default)(deleteUserById.validationScheme), checkUserId, deleteUserById);
    parent
        .use(router.routes())
        .use(router.allowedMethods());
};
