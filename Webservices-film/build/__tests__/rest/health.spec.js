"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const createServer_1 = __importDefault(require("../../src/createServer"));
const package_json_1 = __importDefault(require("../../package.json"));
describe('Health', () => {
    let server;
    let request;
    beforeAll(async () => {
        server = await (0, createServer_1.default)();
        request = (0, supertest_1.default)(server.getApp().callback());
    });
    afterAll(async () => {
        await server.stop();
    });
    describe('GET /api/health/ping', () => {
        const url = '/api/health/ping';
        it('should return pong', async () => {
            const response = await request.get(url);
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ pong: true });
        });
        it('should 400 with unknown query parameters', async () => {
            const response = await request.get(`${url}?invalid=true`);
            expect(response.statusCode).toBe(400);
            expect(response.body.code).toBe('VALIDATION_FAILED');
            expect(response.body.details.query).toHaveProperty('invalid');
        });
    });
    describe('GET /api/health/version', () => {
        const url = '/api/health/version';
        it('should return version from package.json', async () => {
            const response = await request.get(url);
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                env: 'testing',
                version: package_json_1.default.version,
                name: package_json_1.default.name,
            });
        });
        it('should 400 with unknown query parameters', async () => {
            const response = await request.get(`${url}?invalid=true`);
            expect(response.statusCode).toBe(400);
            expect(response.body.code).toBe('VALIDATION_FAILED');
            expect(response.body.details.query).toHaveProperty('invalid');
        });
    });
});
describe('General', () => {
    const url = '/invalid';
    let server;
    let request;
    beforeAll(async () => {
        server = await (0, createServer_1.default)();
        request = (0, supertest_1.default)(server.getApp().callback());
    });
    afterAll(async () => {
        await server.stop();
    });
    it('should return 404 when accessing invalid url', async () => {
        const response = await request.get(url);
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({
            code: 'NOT_FOUND',
            message: `Unknown resource: ${url}`,
        });
    });
});
