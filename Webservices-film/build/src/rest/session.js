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
exports.default = installSessionRoutes;
const router_1 = __importDefault(require("@koa/router"));
const joi_1 = __importDefault(require("joi"));
const validation_1 = __importDefault(require("../core/validation"));
const userService = __importStar(require("../service/user"));
const auth_1 = require("../core/auth");
const login = async (ctx) => {
    const { email, password } = ctx.request.body;
    const token = await userService.login(email, password);
    ctx.status = 200;
    ctx.body = { token };
};
login.validationScheme = {
    body: {
        email: joi_1.default.string().email(),
        password: joi_1.default.string(),
    },
};
function installSessionRoutes(parent) {
    const router = new router_1.default({
        prefix: '/sessions',
    });
    router.post('/', auth_1.authDelay, (0, validation_1.default)(login.validationScheme), login);
    parent.use(router.routes()).use(router.allowedMethods());
}
