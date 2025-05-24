import type supertest from 'supertest';
import { prisma } from '../../src/data';
import withServer from '../helpers/withServer';
import { login, loginAdmin } from '../helpers/login';
import testAuthHeader from '../helpers/testAuthHeader';

const data = {
  awards: [
    { AwardID: 1, Naam: 'Best Actor', Jaar: '2020', FilmID: 1 },
    { AwardID: 2, Naam: 'Best Director', Jaar: '2021', FilmID: 1 },
    { AwardID: 3, Naam: 'Best Film', Jaar: '2022', FilmID: 2 },
  ],
  films: [
    { FilmID: 1, Naam: 'Inception', Jaar: '2010', Duur: '148 min', Genre: 'Science Fiction', 
      Rating: '8.8', RegisseurID: 3, addedByUserID:1 },
  ],
  personen: [
    { PersoonID: 3, Voornaam: 'Christopher', Achternaam: 'Nolan', GeboorteDatum: '1970-07-30', Land: 'USA' },
  ],
};
describe('Awards', () => {
  let request: supertest.Agent;
  let authHeader: string;
  let adminAuthHeader: string;
  
  withServer((r) => (request = r));
  
  beforeAll(async () => {
    authHeader = await login(request);
    adminAuthHeader = await loginAdmin(request);
  }, 20000);
  
  const url = '/api/awards';
  
  // ** Setup data: persons (directors) and films **
  const personsData = [
    { PersoonID: 3, Voornaam: 'Christopher', Achternaam: 'Nolan', GeboorteDatum: '1970-07-30', Land: 'USA' },
  ];
  
  const filmsData = [
    { FilmID: 1, Naam: 'Inception', Jaar: '2010', Duur: '148 min', Genre: 'Science Fiction', 
      Rating: '8.8', RegisseurID: 3 ,addedByUserID:1 },
  ];
  
  const awardsData = [
    { AwardID: 1, Naam: 'Best Director', Jaar: '2010', FilmID: 1 },
    { AwardID: 2, Naam: 'Best Cinematography', Jaar: '2010', FilmID: 1 },
  ];
  
  // ** GET Tests **
  
  describe('GET /api/awards', () => {
    beforeAll(async () => {
      // Ensure persons (directors) and films are created before awards
      await prisma.persoon.createMany({ data: personsData });
      await prisma.films.createMany({ data: filmsData });
      await prisma.awards.createMany({ data: awardsData });
    });
  
    afterAll(async () => {
      await prisma.awards.deleteMany();
      await prisma.films.deleteMany();
      await prisma.persoon.deleteMany();
    });
  
    it('should 200 and return all awards for authenticated user', async () => {
      const response = await request.get(url).set('Authorization', authHeader);
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(2); // Expect 2 awards
    });
  
    it('should 400 for invalid query parameter', async () => {
      const response = await request.get(`${url}?invalid=true`).set('Authorization', authHeader);
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.query).toHaveProperty('invalid');
    });
  
    testAuthHeader(() => request.get(url));
  });
  
  // ** POST Tests **
  
  describe('POST /api/awards', () => {

    beforeAll(async () => {
      await prisma.persoon.createMany({ data: data.personen });
      await prisma.films.createMany({ data: data.films });
    });

    afterAll(async () => {
      await prisma.awards.deleteMany();
      await prisma.films.deleteMany();
      await prisma.persoon.deleteMany();
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

    testAuthHeader(() => request.post(url));
  });

  // ** GET By ID Tests **
  
  describe('GET /api/awards/:id', () => {
    beforeAll(async () => {
      await prisma.persoon.createMany({ data: personsData });
      await prisma.films.createMany({ data: filmsData });
      await prisma.awards.createMany({ data: awardsData });
    });
  
    afterAll(async () => {
      await prisma.awards.deleteMany();
      await prisma.films.deleteMany();
      await prisma.persoon.deleteMany();
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
  
    testAuthHeader(() => request.get(`${url}/1`));
  });
  
  // ** DELETE Tests **
  
  describe('DELETE /api/awards/:id', () => {
    let createdAwards: any[];
  
    beforeAll(async () => {
      await prisma.persoon.createMany({ data: personsData });
      await prisma.films.createMany({ data: filmsData });
      await prisma.awards.createMany({ data: awardsData });
      createdAwards = await prisma.awards.findMany();
    });
  
    afterAll(async () => {
      await prisma.awards.deleteMany();
      await prisma.films.deleteMany();
      await prisma.persoon.deleteMany();
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
  
      const award = await prisma.awards.findUnique({
        where: { AwardID: createdAwards[1].AwardID },
      });
      expect(award).toBeNull();
    });
  
    testAuthHeader(() => request.delete(`${url}/1`));
  });
});
  