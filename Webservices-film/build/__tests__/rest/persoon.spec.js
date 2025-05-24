"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("../../src/data");
const withServer_1 = __importDefault(require("../helpers/withServer"));
const login_1 = require("../helpers/login");
const testAuthHeader_1 = __importDefault(require("../helpers/testAuthHeader"));
const data = {
    personen: [
        { PersoonID: 1, Voornaam: 'Leonardo', Achternaam: 'DiCaprio', GeboorteDatum: '1974-11-11', Land: 'USA' },
        { PersoonID: 2, Voornaam: 'Joseph', Achternaam: 'Gordon-Levitt', GeboorteDatum: '1981-02-17', Land: 'USA' },
        { PersoonID: 3, Voornaam: 'Christopher', Achternaam: 'Nolan', GeboorteDatum: '1970-07-30', Land: 'UK' },
    ],
};
describe('Personen', () => {
    let request;
    let authHeader;
    let adminAuthHeader;
    (0, withServer_1.default)((r) => (request = r));
    beforeAll(async () => {
        authHeader = await (0, login_1.login)(request);
        adminAuthHeader = await (0, login_1.loginAdmin)(request);
    }, 20000);
    const url = '/api/persoon';
    describe('GET /api/persoon', () => {
        beforeAll(async () => {
            await data_1.prisma.persoon.createMany({ data: data.personen });
        });
        afterAll(async () => {
            await data_1.prisma.persoon.deleteMany();
        });
        it('should 200 and return all personen for authenticated user', async () => {
            const response = await request.get(url).set('Authorization', authHeader);
            expect(response.status).toBe(200);
            expect(response.body.items).toHaveLength(3);
        });
        it('should 400 for invalid query parameter', async () => {
            const response = await request.get(`${url}?invalid=true`).set('Authorization', authHeader);
            expect(response.statusCode).toBe(400);
            expect(response.body.code).toBe('VALIDATION_FAILED');
            expect(response.body.details.query).toHaveProperty('invalid');
        });
        (0, testAuthHeader_1.default)(() => request.get(url));
    });
    describe('POST /api/persoon', () => {
        afterAll(async () => {
            await data_1.prisma.persoon.deleteMany();
        });
        it('should 201 and return the created persoon', async () => {
            const response = await request
                .post(url)
                .send({
                Voornaam: 'Emma',
                Achternaam: 'Stone',
                GeboorteDatum: '1988-11-06',
                Land: 'USA',
            })
                .set('Authorization', authHeader);
            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                Voornaam: 'Emma',
                Achternaam: 'Stone',
                Land: 'USA',
            });
        });
        const invalidDataTests = [
            { missingField: 'Voornaam', data: { Achternaam: 'Stone', GeboorteDatum: '1988-11-06', Land: 'USA' } },
            { missingField: 'Achternaam', data: { Voornaam: 'Emma', GeboorteDatum: '1988-11-06', Land: 'USA' } },
            { missingField: 'GeboorteDatum', data: { Voornaam: 'Emma', Achternaam: 'Stone', Land: 'USA' } },
            { missingField: 'Land', data: { Voornaam: 'Emma', Achternaam: 'Stone', GeboorteDatum: '1988-11-06' } },
        ];
        invalidDataTests.forEach(({ missingField, data }) => {
            it(`should 400 when missing ${missingField}`, async () => {
                const response = await request.post(url).send(data).set('Authorization', authHeader);
                expect(response.status).toBe(400);
                expect(response.body.code).toBe('VALIDATION_FAILED');
                expect(response.body.details.body).toHaveProperty(missingField);
            });
        });
        (0, testAuthHeader_1.default)(() => request.post(url));
    });
    describe('DELETE /api/persoon/:id', () => {
        let createdPersonen;
        beforeAll(async () => {
            await data_1.prisma.persoon.createMany({ data: data.personen });
            createdPersonen = await data_1.prisma.persoon.findMany();
        });
        afterAll(async () => {
            await data_1.prisma.persoon.deleteMany();
        });
        it('should 403 when USER tries to delete a persoon', async () => {
            const response = await request.delete(`${url}/${createdPersonen[0].PersoonID}`).set('Authorization', authHeader);
            expect(response.statusCode).toBe(403);
            expect(response.body).toMatchObject({
                code: 'FORBIDDEN',
                message: 'You are not allowed to do this action',
            });
        });
        it('should 204 and allow ADMIN to delete a persoon', async () => {
            const response = await request.delete(`${url}/${createdPersonen[1].PersoonID}`).
                set('Authorization', adminAuthHeader);
            expect(response.statusCode).toBe(204);
            const persoon = await data_1.prisma.persoon.findUnique({
                where: { PersoonID: createdPersonen[1].PersoonID },
            });
            expect(persoon).toBeNull();
        });
        (0, testAuthHeader_1.default)(() => request.delete(`${url}/1`));
    });
    describe('GET /api/persoon/:id', () => {
        beforeAll(async () => {
            await data_1.prisma.persoon.createMany({ data: data.personen });
        });
        afterAll(async () => {
            await data_1.prisma.persoon.deleteMany();
        });
        it('should 200 and return the requested persoon', async () => {
            const response = await request.get(`${url}/1`).set('Authorization', authHeader);
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                PersoonID: 1, Voornaam: 'Leonardo', Achternaam: 'DiCaprio', GeboorteDatum: '1974-11-11', Land: 'USA',
            });
        });
        it('should 404 when requesting not existing person', async () => {
            const response = await request.get(`${url}/200`).set('Authorization', authHeader);
            expect(response.statusCode).toBe(404);
            expect(response.body).toMatchObject({
                code: 'NOT_FOUND',
                message: 'No person with this id exists',
            });
            expect(response.body.stack).toBeTruthy();
        });
        it('should 400 with invalid person id', async () => {
            const response = await request.get(`${url}/invalid`).set('Authorization', authHeader);
            expect(response.statusCode).toBe(400);
            expect(response.body.code).toBe('VALIDATION_FAILED');
            expect(response.body.details.params).toHaveProperty('id');
        });
        (0, testAuthHeader_1.default)(() => request.get(url));
    });
});
