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
    locaties: [
        { LocatieID: 1, Straat: '5th Avenue', Stad: 'New York', Land: 'USA', Foto: '' },
        { LocatieID: 2, Straat: 'Baker Street', Stad: 'London', Land: 'UK', Foto: '' },
        { LocatieID: 3, Straat: 'Champs-Élysées', Stad: 'Paris', Land: 'France', Foto: '' },
    ],
};
describe('Locatie', () => {
    let request;
    let authHeader;
    let adminAuthHeader;
    (0, withServer_1.default)((r) => (request = r));
    beforeAll(async () => {
        authHeader = await (0, login_1.login)(request);
        adminAuthHeader = await (0, login_1.loginAdmin)(request);
    }, 20000);
    const url = '/api/locatie';
    describe('GET /api/locatie', () => {
        beforeAll(async () => {
            await data_1.prisma.locatie.createMany({ data: data.locaties });
        });
        afterAll(async () => {
            await data_1.prisma.locatie.deleteMany();
        });
        it('should 200 and return all locaties for authenticated user', async () => {
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
    describe('POST /api/locatie', () => {
        afterAll(async () => {
            await data_1.prisma.locatie.deleteMany();
        });
        it('should 201 and return the created locatie', async () => {
            const response = await request.post(url).send({
                Straat: 'Avenida Paulista',
                Stad: 'São Paulo',
                Land: 'Brazil',
            })
                .set('Authorization', authHeader);
            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                Straat: 'Avenida Paulista',
                Stad: 'São Paulo',
                Land: 'Brazil',
            });
        });
        const invalidDataTests = [
            { missingField: 'Straat', data: { Stad: 'São Paulo', Land: 'Brazil' } },
            { missingField: 'Stad', data: { Straat: 'Avenida Paulista', Land: 'Brazil' } },
            { missingField: 'Land', data: { Straat: 'Avenida Paulista', Stad: 'São Paulo' } },
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
    describe('DELETE /api/locatie/:id', () => {
        let createdLocaties;
        beforeAll(async () => {
            await data_1.prisma.locatie.createMany({ data: data.locaties });
            createdLocaties = await data_1.prisma.locatie.findMany();
        });
        afterAll(async () => {
            await data_1.prisma.locatie.deleteMany();
        });
        it('should 403 when USER tries to delete a locatie', async () => {
            const response = await request
                .delete(`${url}/${createdLocaties[0].LocatieID}`)
                .set('Authorization', authHeader);
            expect(response.statusCode).toBe(403);
            expect(response.body).toMatchObject({
                code: 'FORBIDDEN',
                message: 'You are not allowed to do this action',
            });
        });
        it('should 204 and allow ADMIN to delete a locatie', async () => {
            const response = await request
                .delete(`${url}/${createdLocaties[1].LocatieID}`)
                .set('Authorization', adminAuthHeader);
            expect(response.statusCode).toBe(204);
            const locatie = await data_1.prisma.locatie.findUnique({
                where: { LocatieID: createdLocaties[1].LocatieID },
            });
            expect(locatie).toBeNull();
        });
        (0, testAuthHeader_1.default)(() => request.delete(`${url}/1`));
    });
    describe('GET /api/locatie/:id', () => {
        beforeAll(async () => {
            await data_1.prisma.locatie.createMany({ data: data.locaties });
        });
        afterAll(async () => {
            await data_1.prisma.locatie.deleteMany();
        });
        it('should 200 and return the requested locatie', async () => {
            const response = await request
                .get(`${url}/1`)
                .set('Authorization', authHeader);
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                LocatieID: 1,
                Straat: '5th Avenue',
                Stad: 'New York',
                Land: 'USA',
                Foto: '',
            });
        });
        it('should 404 when requesting a non-existing locatie', async () => {
            const response = await request.get(`${url}/200`).set('Authorization', authHeader);
            expect(response.statusCode).toBe(404);
            expect(response.body).toMatchObject({
                code: 'NOT_FOUND',
                message: 'Er bestaat geen locatie met dit ID',
            });
        });
        it('should 400 with an invalid locatie id', async () => {
            const response = await request.get(`${url}/invalid`).set('Authorization', authHeader);
            expect(response.statusCode).toBe(400);
            expect(response.body.code).toBe('VALIDATION_FAILED');
            expect(response.body.details.params).toHaveProperty('id');
        });
        (0, testAuthHeader_1.default)(() => request.get(url));
    });
});
