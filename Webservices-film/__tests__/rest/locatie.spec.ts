import type supertest from 'supertest';
import { prisma } from '../../src/data';
import withServer from '../helpers/withServer';
import { login, loginAdmin } from '../helpers/login';
import testAuthHeader from '../helpers/testAuthHeader';

const data = {
  locaties: [
    { LocatieID: 1, Straat: '5th Avenue', Stad: 'New York', Land: 'USA', Foto: '' },
    { LocatieID: 2, Straat: 'Baker Street', Stad: 'London', Land: 'UK', Foto: '' },
    { LocatieID: 3, Straat: 'Champs-Élysées', Stad: 'Paris', Land: 'France', Foto: '' },
  ],
  films:[
    {FilmID: 1, Naam: 'Inception', Jaar: '2010', Duur: '148 min', Genre: 'Science Fiction', 
      Rating: '8.8', RegisseurID: 3 },
  ],
};

describe('Locatie', () => {
  let request: supertest.Agent;
  let authHeader: string;
  let adminAuthHeader: string;

  withServer((r) => (request = r));

  beforeAll(async () => {
    authHeader = await login(request);
    adminAuthHeader = await loginAdmin(request);
  }, 20000);

  const url = '/api/locatie';

  // ** GET Tests **

  describe('GET /api/locatie', () => {
    beforeAll(async () => {
      await prisma.locatie.createMany({ data: data.locaties });
    });

    afterAll(async () => {
      await prisma.locatie.deleteMany();
    });

    it('should 200 and return all locaties for authenticated user', async () => {
      const response = await request.get(url).set('Authorization', authHeader);
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(3); // Check length of the 'items' array
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

  describe('POST /api/locatie', () => {
    afterAll(async () => {
      await prisma.locatie.deleteMany();
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

    testAuthHeader(() => request.post(url));
  });

  // ** DELETE Tests **

  describe('DELETE /api/locatie/:id', () => {
    let createdLocaties: any[];

    beforeAll(async () => {
      await prisma.locatie.createMany({ data: data.locaties });
      createdLocaties = await prisma.locatie.findMany();
    });

    afterAll(async () => {
      await prisma.locatie.deleteMany();
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

      const locatie = await prisma.locatie.findUnique({
        where: { LocatieID: createdLocaties[1].LocatieID },
      });
      expect(locatie).toBeNull();
    });

    testAuthHeader(() => request.delete(`${url}/1`));
  });

  // ** GET By ID Tests **

  describe('GET /api/locatie/:id', () => {
    beforeAll(async () => {
      await prisma.locatie.createMany({ data: data.locaties });
    });

    afterAll(async () => {
      await prisma.locatie.deleteMany();
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
        Films: [], 
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

    testAuthHeader(() => request.get(url));
  });
});
