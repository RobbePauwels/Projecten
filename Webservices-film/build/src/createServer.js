"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createServer;
const koa_1 = __importDefault(require("koa"));
const logging_1 = require("./core/logging");
const index_1 = __importDefault(require("./rest/index"));
const data_1 = require("./data");
const installMiddlewares_1 = __importDefault(require("./core/installMiddlewares"));
const config_1 = __importDefault(require("config"));
const PORT = config_1.default.get('port');
async function createServer() {
    const app = new koa_1.default();
    (0, installMiddlewares_1.default)(app);
    await (0, data_1.initializeData)();
    (0, index_1.default)(app);
    return {
        getApp() {
            return app;
        },
        start() {
            return new Promise((resolve) => {
                app.listen(PORT);
                (0, logging_1.getLogger)().info(`🚀 Server listening on http://localhost:${PORT}`);
                resolve();
            });
        },
        async stop() {
            app.removeAllListeners();
            await (0, data_1.shutdownData)();
            (0, logging_1.getLogger)().info('Goodbye! 👋');
        },
    };
}
