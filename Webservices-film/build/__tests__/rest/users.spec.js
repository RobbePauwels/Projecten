"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("../../src/data");
const withServer_1 = __importDefault(require("../helpers/withServer"));
const login_1 = require("../helpers/login");
const testAuthHeader_1 = __importDefault(require("../helpers/testAuthHeader"));
describe('Users', () => {
    let request;
    let authHeader;
    let adminAuthHeader;
    (0, withServer_1.default)((r) => (request = r));
    beforeAll(async () => {
        authHeader = await (0, login_1.login)(request);
        adminAuthHeader = await (0, login_1.loginAdmin)(request);
    }, 20000);
    const url = '/api/users';
    describe('GET /api/users', () => {
        it('should 200 and return all users for an admin', async () => {
            const response = await request.get(url).set('Authorization', adminAuthHeader);
            expect(response.statusCode).toBe(200);
            expect(response.body.items.length).toBe(2);
            expect(response.body.items).toEqual(expect.arrayContaining([{
                    id: 1,
                    naam: 'Test User',
                    email: 'test.user@hogent.be',
                }, {
                    id: 2,
                    naam: 'Admin User',
                    email: 'admin.user@hogent.be',
                }]));
        });
        it('should 400 when given an argument', async () => {
            const response = await request.get(`${url}?invalid=true`).set('Authorization', adminAuthHeader);
            expect(response.statusCode).toBe(400);
            expect(response.body.code).toBe('VALIDATION_FAILED');
            expect(response.body.details.query).toHaveProperty('invalid');
        });
        it('should 403 when not an admin', async () => {
            const response = await request.get(url).set('Authorization', authHeader);
            expect(response.statusCode).toBe(403);
            expect(response.body).toMatchObject({
                code: 'FORBIDDEN',
                message: 'You are not allowed to view this part of the application',
            });
        });
        (0, testAuthHeader_1.default)(() => request.get(url));
    });
    describe('GET /api/user/:id', () => {
        it('should 200 and return the requested user', async () => {
            const response = await request.get(`${url}/1`).set('Authorization', authHeader);
            expect(response.statusCode).toBe(200);
            expect(response.body).toMatchObject({
                id: 1,
                naam: 'Test User',
            });
        });
        it('should 200 and return my user info when passing \'me\' as id', async () => {
            const response = await request.get(`${url}/me`).set('Authorization', authHeader);
            expect(response.statusCode).toBe(200);
            expect(response.body).toMatchObject({
                id: 1,
                naam: 'Test User',
            });
        });
        it('should 404 with not existing user (and admin user requesting)', async () => {
            const response = await request.get(`${url}/123`).set('Authorization', adminAuthHeader);
            expect(response.statusCode).toBe(404);
            expect(response.body).toMatchObject({
                code: 'NOT_FOUND',
                message: 'No user with this id exists',
            });
            expect(response.body.stack).toBeTruthy();
        });
        it('should 400 with invalid user id (and admin user requesting)', async () => {
            const response = await request.get(`${url}/invalid`).set('Authorization', adminAuthHeader);
            expect(response.statusCode).toBe(400);
            expect(response.body.code).toBe('VALIDATION_FAILED');
            expect(response.body.details.params).toHaveProperty('id');
        });
        it('should 403 when not an admin and not own user id', async () => {
            const response = await request.get(`${url}/2`).set('Authorization', authHeader);
            expect(response.statusCode).toBe(403);
            expect(response.body).toMatchObject({
                code: 'FORBIDDEN',
                message: 'You are not allowed to view this user\'s information',
            });
        });
        (0, testAuthHeader_1.default)(() => request.get(`${url}/1`));
    });
    describe('POST /api/users', () => {
        afterAll(async () => {
            await data_1.prisma.user.deleteMany({
                where: {
                    email: 'new.user@hogent.be',
                },
            });
        });
        it('should 200 and return the registered user', async () => {
            const response = await request.post(url)
                .send({
                name: 'New User',
                email: 'new.user@hogent.be',
                password: '123456789101112',
            })
                .set('Authorization', authHeader);
            expect(response.statusCode).toBe(200);
            expect(response.body.token).toBeDefined();
        });
    });
    describe('PUT /api/users/:id', () => {
        it('should 200 and return the updated user', async () => {
            const response = await request.put(`${url}/1`)
                .send({
                name: 'Changed name',
                email: 'new.user@hogent.be',
            })
                .set('Authorization', adminAuthHeader);
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                id: 1,
                naam: 'Changed name',
                email: 'new.user@hogent.be',
            });
        });
        it('should 403 when not an admin and not own user id', async () => {
            const response = await request.put(`${url}/2`)
                .send({
                name: 'Changed name',
                email: 'new.user@hogent.be',
            })
                .set('Authorization', authHeader);
            expect(response.statusCode).toBe(403);
            expect(response.body).toMatchObject({
                code: 'FORBIDDEN',
                message: 'You are not allowed to view this user\'s information',
            });
        });
        (0, testAuthHeader_1.default)(() => request.put(`${url}/1`));
    });
    describe('DELETE /api/users/:id', () => {
        it('should 403 and message not allowed', async () => {
            const response = await request.delete(`${url}/1`).set('Authorization', authHeader);
            expect(response.statusCode).toBe(204);
            expect(response.body).toEqual({});
        });
        it('should 404 with not existing user', async () => {
            const response = await request.delete(`${url}/123`).set('Authorization', adminAuthHeader);
            expect(response.statusCode).toBe(404);
            expect(response.body).toMatchObject({
                code: 'NOT_FOUND',
                message: 'No user with this ID exists',
            });
            expect(response.body.stack).toBeTruthy();
        });
        it('should 403 when not an admin and not own user id', async () => {
            const response = await request.delete(`${url}/2`).set('Authorization', authHeader);
            expect(response.statusCode).toBe(403);
            expect(response.body).toMatchObject({
                code: 'FORBIDDEN',
                message: 'You are not allowed to view this user\'s information',
            });
        });
        (0, testAuthHeader_1.default)(() => request.delete(`${url}/1`));
    });
});
