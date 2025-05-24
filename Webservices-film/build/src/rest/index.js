"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = __importDefault(require("@koa/router"));
const film_1 = __importDefault(require("./film"));
const health_1 = __importDefault(require("./health"));
const persoon_1 = __importDefault(require("./persoon"));
const locatie_1 = __importDefault(require("./locatie"));
const award_1 = __importDefault(require("./award"));
const user_1 = __importDefault(require("./user"));
const session_1 = __importDefault(require("./session"));
exports.default = (app) => {
    const router = new router_1.default({
        prefix: '/api',
    });
    (0, film_1.default)(router);
    (0, health_1.default)(router);
    (0, persoon_1.default)(router);
    (0, locatie_1.default)(router);
    (0, award_1.default)(router);
    (0, user_1.default)(router);
    (0, session_1.default)(router);
    app.use(router.routes()).use(router.allowedMethods());
};
