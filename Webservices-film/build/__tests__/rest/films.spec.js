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
    films: [
        { FilmID: 1, Naam: 'Inception', Jaar: '2010', Duur: '148 min', Genre: 'Science Fiction',
            Rating: '8.8', RegisseurID: 3 },
    ],
    personen: [
        { PersoonID: 1, Voornaam: 'Leonardo', Achternaam: 'DiCaprio', GeboorteDatum: '1974-11-11', Land: 'USA' },
        { PersoonID: 2, Voornaam: 'Joseph', Achternaam: 'Gordon-Levitt', GeboorteDatum: '1981-02-17', Land: 'USA' },
        { PersoonID: 3, Voornaam: 'Christopher', Achternaam: 'Nolan', GeboorteDatum: '1970-07-30', Land: 'USA' },
    ],
};
describe('Films', () => {
    let request;
    let authHeader;
    let adminAuthHeader;
    (0, withServer_1.default)((r) => (request = r));
    beforeAll(async () => {
        authHeader = await (0, login_1.login)(request);
        adminAuthHeader = await (0, login_1.loginAdmin)(request);
    }, 20000);
    const url = '/api/film';
    describe('GET /api/film', () => {
        beforeAll(async () => {
            await data_1.prisma.persoon.createMany({ data: data.personen });
            await data_1.prisma.films.createMany({ data: data.films });
        });
        afterAll(async () => {
            await data_1.prisma.film_Locatie.deleteMany();
            await data_1.prisma.film_Acteur.deleteMany();
            await data_1.prisma.awards.deleteMany();
            await data_1.prisma.locatie.deleteMany();
            await data_1.prisma.persoon.deleteMany();
            await data_1.prisma.films.deleteMany();
        });
        it('should 200 and return all films for authenticated user', async () => {
            const response = await request.get(url).set('Authorization', authHeader);
            expect(response.status).toBe(200);
            expect(response.body.items.length).toBe(1);
        });
        it('should 400 for invalid query parameter', async () => {
            const response = await request.get(`${url}?invalid=true`).set('Authorization', authHeader);
            expect(response.statusCode).toBe(400);
            expect(response.body.code).toBe('VALIDATION_FAILED');
            expect(response.body.details.query).toHaveProperty('invalid');
        });
        (0, testAuthHeader_1.default)(() => request.get(url));
    });
    describe('POST /api/film', () => {
        beforeAll(async () => {
            await data_1.prisma.persoon.createMany({
                data: [
                    { PersoonID: 1, Voornaam: 'Leonardo', Achternaam: 'DiCaprio', GeboorteDatum: '1974-11-11', Land: 'USA' },
                    { PersoonID: 2, Voornaam: 'Joseph', Achternaam: 'Gordon-Levitt', GeboorteDatum: '1981-02-17', Land: 'USA' },
                    { PersoonID: 3, Voornaam: 'Christopher', Achternaam: 'Nolan', GeboorteDatum: '1970-07-30', Land: 'UK' },
                ],
            });
            await data_1.prisma.locatie.createMany({
                data: [
                    { LocatieID: 1, Straat: 'Strandvägen', Stad: 'Stockholm', Land: 'Sweden' },
                    { LocatieID: 2, Straat: 'Hollywood Blvd', Stad: 'Los Angeles', Land: 'USA' },
                ],
            });
        });
        afterAll(async () => {
            await data_1.prisma.film_Locatie.deleteMany();
            await data_1.prisma.film_Acteur.deleteMany();
            await data_1.prisma.awards.deleteMany();
            await data_1.prisma.locatie.deleteMany();
            await data_1.prisma.persoon.deleteMany();
            await data_1.prisma.films.deleteMany();
        });
        it('should 201 and return created film', async () => {
            const response = await request
                .post(url)
                .send({
                Naam: 'Inception',
                Jaar: '2010',
                Duur: '148 min',
                Genre: 'Science Fiction',
                Rating: '8.8',
                RegisseurID: 3,
            })
                .set('Authorization', authHeader);
            expect(response.status).toBe(201);
            expect(response.body.FilmID).toBeTruthy();
            expect(response.body.Naam).toBe('Inception');
        });
        const invalidDataTests = [
            { missingField: 'Naam', data: { Jaar: '2010', Duur: '148 min', Genre: 'Science Fiction',
                    Rating: '8.8', RegisseurID: 3 } },
            { missingField: 'Jaar', data: { Naam: 'Inception', Duur: '148 min', Genre: 'Science Fiction',
                    Rating: '8.8', RegisseurID: 3 } },
            { missingField: 'RegisseurID', data: { Naam: 'Inception', Jaar: '2010', Duur: '148 min',
                    Genre: 'Science Fiction', Rating: '8.8' } },
        ];
        invalidDataTests.forEach(({ missingField, data }) => {
            it(`should 400 when missing ${missingField}`, async () => {
                const response = await request
                    .post(url)
                    .send(data)
                    .set('Authorization', authHeader);
                expect(response.status).toBe(400);
                expect(response.body.code).toBe('VALIDATION_FAILED');
                expect(response.body.details.body).toHaveProperty(missingField);
            });
        });
        (0, testAuthHeader_1.default)(() => request.post(url));
    });
    describe('DELETE /api/film/:id', () => {
        let createdFilms;
        beforeAll(async () => {
            await data_1.prisma.persoon.createMany({ data: data.personen });
            await data_1.prisma.films.createMany({ data: data.films });
            createdFilms = await data_1.prisma.films.findMany();
        });
        afterAll(async () => {
            await data_1.prisma.film_Locatie.deleteMany();
            await data_1.prisma.film_Acteur.deleteMany();
            await data_1.prisma.awards.deleteMany();
            await data_1.prisma.locatie.deleteMany();
            await data_1.prisma.persoon.deleteMany();
            await data_1.prisma.films.deleteMany();
        });
        it('should 403 when USER tries to delete a film', async () => {
            expect(createdFilms.length).toBeGreaterThan(0);
            const response = await request
                .delete(`${url}/${createdFilms[0].FilmID}`)
                .set('Authorization', authHeader);
            expect(response.statusCode).toBe(403);
            expect(response.body).toMatchObject({
                code: 'FORBIDDEN',
                message: 'You are not allowed to do this action',
            });
        });
        it('should 204 and allow ADMIN to delete a film', async () => {
            expect(createdFilms.length).toBeGreaterThan(0);
            const response = await request
                .delete(`${url}/${createdFilms[0].FilmID}`)
                .set('Authorization', adminAuthHeader);
            expect(response.statusCode).toBe(204);
            const film = await data_1.prisma.films.findUnique({
                where: { FilmID: createdFilms[0].FilmID },
            });
            expect(film).toBeNull();
        });
        (0, testAuthHeader_1.default)(() => request.delete(`${url}/1`));
    });
    describe('PUT /api/film/:id', () => {
        let createdFilms;
        beforeAll(async () => {
            await data_1.prisma.persoon.createMany({ data: data.personen });
            await data_1.prisma.films.createMany({ data: data.films });
            createdFilms = await data_1.prisma.films.findMany();
        });
        afterAll(async () => {
            await data_1.prisma.film_Locatie.deleteMany();
            await data_1.prisma.film_Acteur.deleteMany();
            await data_1.prisma.awards.deleteMany();
            await data_1.prisma.locatie.deleteMany();
            await data_1.prisma.persoon.deleteMany();
            await data_1.prisma.films.deleteMany();
        });
        it('should 200 and update the film', async () => {
            expect(createdFilms.length).toBeGreaterThan(0);
            const updatedFilmData = {
                Naam: 'Inception Updated',
                Jaar: '2012',
                Duur: '150 min',
                Genre: 'Action',
                Rating: '9.0',
            };
            const response = await request
                .put(`${url}/${createdFilms[0].FilmID}`)
                .send(updatedFilmData)
                .set('Authorization', adminAuthHeader);
            expect(response.statusCode).toBe(200);
            expect(response.body).toMatchObject({
                FilmID: createdFilms[0].FilmID,
                Naam: 'Inception Updated',
                Jaar: '2012',
                Duur: '150 min',
                Genre: 'Action',
                Rating: '9.0',
            });
            const updatedFilm = await data_1.prisma.films.findUnique({
                where: { FilmID: createdFilms[0].FilmID },
            });
            expect(updatedFilm).toMatchObject(updatedFilmData);
        });
        it('should 400 for invalid data', async () => {
            const invalidData = { Jaar: 'Invalid Year', Duur: -100 };
            const response = await request
                .put(`${url}/${createdFilms[0].FilmID}`)
                .send(invalidData)
                .set('Authorization', adminAuthHeader);
            expect(response.statusCode).toBe(400);
            expect(response.body.code).toBe('VALIDATION_FAILED');
        });
        it('should 403 when USER tries to update a film', async () => {
            const updatedFilmData = {
                Naam: 'Inception Updated by User',
                Jaar: '2012',
                Duur: '150 min',
                Genre: 'Action',
                Rating: '9.0',
            };
            const response = await request
                .put(`${url}/${createdFilms[0].FilmID}`)
                .send(updatedFilmData)
                .set('Authorization', authHeader);
            expect(response.statusCode).toBe(403);
            expect(response.body).toMatchObject({
                code: 'FORBIDDEN',
                message: 'You are not allowed to do this action',
            });
        });
        (0, testAuthHeader_1.default)(() => request.put(`${url}/1`));
    });
    describe('GET /api/film/:id', () => {
        let createdFilms;
        beforeAll(async () => {
            await data_1.prisma.persoon.createMany({ data: data.personen });
            await data_1.prisma.films.createMany({ data: data.films });
            createdFilms = await data_1.prisma.films.findMany();
        });
        afterAll(async () => {
            await data_1.prisma.film_Locatie.deleteMany();
            await data_1.prisma.film_Acteur.deleteMany();
            await data_1.prisma.awards.deleteMany();
            await data_1.prisma.locatie.deleteMany();
            await data_1.prisma.persoon.deleteMany();
            await data_1.prisma.films.deleteMany();
        });
        it('should 200 and return the requested film', async () => {
            const filmId = createdFilms[0].FilmID;
            const response = await request
                .get(`/api/film/${filmId}`)
                .set('Authorization', authHeader);
            expect(response.statusCode).toBe(200);
        });
        it('should 404 when requesting a non-existing film', async () => {
            const response = await request
                .get('/api/film/999')
                .set('Authorization', authHeader);
            expect(response.statusCode).toBe(404);
            expect(response.body).toMatchObject({
                code: 'NOT_FOUND',
                message: 'Geen film gevonden met FilmID 999',
            });
            expect(response.body.stack).toBeTruthy();
        });
        it('should 400 with invalid film id', async () => {
            const response = await request
                .get('/api/film/invalid')
                .set('Authorization', authHeader);
            expect(response.statusCode).toBe(400);
            expect(response.body.code).toBe('VALIDATION_FAILED');
            expect(response.body.details.params).toHaveProperty('id');
        });
        (0, testAuthHeader_1.default)(() => request.get('/api/film/1'));
    });
});
