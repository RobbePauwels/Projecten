"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = withServer;
const supertest_1 = __importDefault(require("supertest"));
const createServer_1 = __importDefault(require("../../src/createServer"));
const data_1 = require("../../src/data");
const password_1 = require("../../src/core/password");
const roles_1 = __importDefault(require("../../src/core/roles"));
function withServer(setter) {
    let server;
    beforeAll(async () => {
        server = await (0, createServer_1.default)();
        const passwordHash = await (0, password_1.hashPassword)('12345678');
        await data_1.prisma.user.createMany({
            data: [
                {
                    id: 1,
                    naam: 'Test User',
                    email: 'test.user@hogent.be',
                    password_hash: passwordHash,
                    roles: JSON.stringify([roles_1.default.USER]),
                },
                {
                    id: 2,
                    naam: 'Admin User',
                    email: 'admin.user@hogent.be',
                    password_hash: passwordHash,
                    roles: JSON.stringify([roles_1.default.ADMIN, roles_1.default.USER]),
                },
            ],
        });
        setter((0, supertest_1.default)(server.getApp().callback()));
    });
    afterAll(async () => {
        await data_1.prisma.user.deleteMany();
        await server.stop();
    });
}
