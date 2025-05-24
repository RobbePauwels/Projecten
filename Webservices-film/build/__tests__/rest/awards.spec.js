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
    awards: [
        { AwardID: 1, Naam: 'Best Actor', Jaar: '2020', FilmID: 1 },
        { AwardID: 2, Naam: 'Best Director', Jaar: '2021', FilmID: 1 },
        { AwardID: 3, Naam: 'Best Film', Jaar: '2022', FilmID: 2 },
    ],
    films: [
        { FilmID: 1, Naam: 'Inception', Jaar: '2010', Duur: '148 min', Genre: 'Science Fiction',
            Rating: '8.8', RegisseurID: 3 },
    ],
    personen: [
        { PersoonID: 3, Voornaam: 'Christopher', Achternaam: 'Nolan', GeboorteDatum: '1970-07-30', Land: 'USA' },
    ],
};
describe('Awards', () => {
    let request;
    let authHeader;
    let adminAuthHeader;
    (0, withServer_1.default)((r) => (request = r));
    beforeAll(async () => {
        authHeader = await (0, login_1.login)(request);
        adminAuthHeader = await (0, login_1.loginAdmin)(request);
    }, 20000);
    const url = '/api/awards';
    const personsData = [
        { PersoonID: 3, Voornaam: 'Christopher', Achternaam: 'Nolan', GeboorteDatum: '1970-07-30', Land: 'USA' },
    ];
    const filmsData = [
        { FilmID: 1, Naam: 'Inception', Jaar: '2010', Duur: '148 min', Genre: 'Science Fiction',
            Rating: '8.8', RegisseurID: 3 },
    ];
    const awardsData = [
        { AwardID: 1, Naam: 'Best Director', Jaar: '2010', FilmID: 1 },
        { AwardID: 2, Naam: 'Best Cinematography', Jaar: '2010', FilmID: 1 },
    ];
    describe('GET /api/awards', () => {
        beforeAll(async () => {
            await data_1.prisma.persoon.createMany({ data: personsData });
            await data_1.prisma.films.createMany({ data: filmsData });
            await data_1.prisma.awards.createMany({ data: awardsData });
        });
        afterAll(async () => {
            await data_1.prisma.awards.deleteMany();
            await data_1.prisma.films.deleteMany();
            await data_1.prisma.persoon.deleteMany();
        });
        it('should 200 and return all awards for authenticated user', async () => {
            const response = await request.get(url).set('Authorization', authHeader);
            expect(response.status).toBe(200);
            expect(response.body.items).toHaveLength(2);
        });
        it('should 400 for invalid query parameter', async () => {
            const response = await request.get(`${url}?invalid=true`).set('Authorization', authHeader);
            expect(response.statusCode).toBe(400);
            expect(response.body.code).toBe('VALIDATION_FAILED');
            expect(response.body.details.query).toHaveProperty('invalid');
        });
        (0, testAuthHeader_1.default)(() => request.get(url));
    });
    describe('POST /api/awards', () => {
        beforeAll(async () => {
            await data_1.prisma.persoon.createMany({ data: data.personen });
            await data_1.prisma.films.createMany({ data: data.films });
        });
        afterAll(async () => {
            await data_1.prisma.awards.deleteMany();
            await data_1.prisma.films.deleteMany();
            await data_1.prisma.persoon.deleteMany();
        });
        it('should 201 and return the created award', async () => {
            const response = await request.post(url).send({
                Naam: 'Best Cinematography',
                Jaar: '2023',
                FilmID: 1,
            })
                .set('Authorization', authHeader);
            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                Naam: 'Best Cinematography',
                Jaar: '2023',
                FilmID: 1,
            });
        });
        const invalidDataTests = [
            { missingField: 'Naam', data: { Jaar: '2023', FilmID: 1 } },
            { missingField: 'Jaar', data: { Naam: 'Best Cinematography', FilmID: 1 } },
            { missingField: 'FilmID', data: { Naam: 'Best Cinematography', Jaar: '2023' } },
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
    describe('GET /api/awards/:id', () => {
        beforeAll(async () => {
            await data_1.prisma.persoon.createMany({ data: personsData });
            await data_1.prisma.films.createMany({ data: filmsData });
            await data_1.prisma.awards.createMany({ data: awardsData });
        });
        afterAll(async () => {
            await data_1.prisma.awards.deleteMany();
            await data_1.prisma.films.deleteMany();
            await data_1.prisma.persoon.deleteMany();
        });
        it('should 200 and return the requested award', async () => {
            const response = await request
                .get(`${url}/1`)
                .set('Authorization', authHeader);
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                AwardID: 1,
                Naam: 'Best Director',
                Jaar: '2010',
                FilmID: 1,
            });
        });
        it('should 404 when requesting a non-existing award', async () => {
            const response = await request.get(`${url}/200`).set('Authorization', authHeader);
            expect(response.statusCode).toBe(404);
            expect(response.body).toMatchObject({
                code: 'NOT_FOUND',
                message: 'Er bestaat geen award met dit ID',
            });
        });
        it('should 400 with an invalid award id', async () => {
            const response = await request.get(`${url}/invalid`).set('Authorization', authHeader);
            expect(response.statusCode).toBe(400);
            expect(response.body.code).toBe('VALIDATION_FAILED');
            expect(response.body.details.params).toHaveProperty('id');
        });
        (0, testAuthHeader_1.default)(() => request.get(`${url}/1`));
    });
    describe('DELETE /api/awards/:id', () => {
        let createdAwards;
        beforeAll(async () => {
            await data_1.prisma.persoon.createMany({ data: personsData });
            await data_1.prisma.films.createMany({ data: filmsData });
            await data_1.prisma.awards.createMany({ data: awardsData });
            createdAwards = await data_1.prisma.awards.findMany();
        });
        afterAll(async () => {
            await data_1.prisma.awards.deleteMany();
            await data_1.prisma.films.deleteMany();
            await data_1.prisma.persoon.deleteMany();
        });
        it('should 403 when USER tries to delete an award', async () => {
            const response = await request
                .delete(`${url}/${createdAwards[0].AwardID}`)
                .set('Authorization', authHeader);
            expect(response.statusCode).toBe(403);
            expect(response.body).toMatchObject({
                code: 'FORBIDDEN',
                message: 'You are not allowed to do this action',
            });
        });
        it('should 204 and allow ADMIN to delete an award', async () => {
            const response = await request
                .delete(`${url}/${createdAwards[1].AwardID}`)
                .set('Authorization', adminAuthHeader);
            expect(response.statusCode).toBe(204);
            const award = await data_1.prisma.awards.findUnique({
                where: { AwardID: createdAwards[1].AwardID },
            });
            expect(award).toBeNull();
        });
        (0, testAuthHeader_1.default)(() => request.delete(`${url}/1`));
    });
});
