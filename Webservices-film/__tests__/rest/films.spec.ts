import type supertest from 'supertest';
import { prisma } from '../../src/data';
import withServer from '../helpers/withServer';
import { login, loginAdmin } from '../helpers/login';
import testAuthHeader from '../helpers/testAuthHeader';

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
  let request: supertest.Agent;
  let authHeader: string;
  let adminAuthHeader: string;

  withServer((r) => (request = r));

  beforeAll(async () => {
    
    authHeader = await login(request);
    adminAuthHeader = await loginAdmin(request);
  }, 20000);

  const url = '/api/film';

  // ** GET Tests **
  describe('GET /api/film', () => {
    beforeAll(async () => {
      await prisma.persoon.createMany({ data: data.personen });
      await prisma.films.createMany({ data: data.films });
    });

    afterAll(async () => {
      await prisma.film_Locatie.deleteMany();
      await prisma.film_Acteur.deleteMany();
      await prisma.awards.deleteMany();
      await prisma.locatie.deleteMany();
      await prisma.persoon.deleteMany();
      await prisma.films.deleteMany();
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

    testAuthHeader(() => request.get(url));
  });

  // ** POST Tests **
  describe('POST /api/film', () => {
    beforeAll(async () => {
      await prisma.persoon.createMany({
        data: [
          { PersoonID: 1, Voornaam: 'Leonardo', Achternaam: 'DiCaprio', GeboorteDatum: '1974-11-11', Land: 'USA' },
          { PersoonID: 2, Voornaam: 'Joseph', Achternaam: 'Gordon-Levitt', GeboorteDatum: '1981-02-17', Land: 'USA' },
          { PersoonID: 3, Voornaam: 'Christopher', Achternaam: 'Nolan', GeboorteDatum: '1970-07-30', Land: 'UK' },
        ],
      });
      await prisma.locatie.createMany({
        data: [
          { LocatieID: 1, Straat: 'Strandvägen', Stad: 'Stockholm', Land: 'Sweden' },
          { LocatieID: 2, Straat: 'Hollywood Blvd', Stad: 'Los Angeles', Land: 'USA' },
        ],
      });
    });

    afterAll(async () => {
      await prisma.film_Locatie.deleteMany();
      await prisma.film_Acteur.deleteMany();
      await prisma.awards.deleteMany();
      await prisma.locatie.deleteMany();
      await prisma.persoon.deleteMany();
      await prisma.films.deleteMany();
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

    testAuthHeader(() => request.post(url));
  });

  // ** DELETE Tests **
  describe('DELETE /api/film/:id', () => {
    let createdFilms: any[];
  
    beforeAll(async () => {
      await prisma.persoon.createMany({ data: data.personen });
  
      // Create the films and ensure they are stored correctly in the database
      await prisma.films.createMany({ data: data.films });
  
      // Fetch the films after creating them to populate `createdFilms`
      createdFilms = await prisma.films.findMany();
    });
  
    afterAll(async () => {
      await prisma.film_Locatie.deleteMany();
      await prisma.film_Acteur.deleteMany();
      await prisma.awards.deleteMany();
      await prisma.locatie.deleteMany();
      await prisma.persoon.deleteMany();
      await prisma.films.deleteMany();
    });
  
    it('should 403 when USER tries to delete a film', async () => {
      // Ensure createdFilms array is populated before making the delete request
      expect(createdFilms.length).toBeGreaterThan(0);  // Check that films were actually created
  
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
      // Ensure createdFilms array is populated before making the delete request
      expect(createdFilms.length).toBeGreaterThan(0);  // Check that films were actually created
  
      const response = await request
        .delete(`${url}/${createdFilms[0].FilmID}`)
        .set('Authorization', adminAuthHeader);
  
      expect(response.statusCode).toBe(204);
  
      // Verify that the film is actually deleted from the database
      const film = await prisma.films.findUnique({
        where: { FilmID: createdFilms[0].FilmID },
      });
      expect(film).toBeNull();  // Film should be deleted
    });
  
    testAuthHeader(() => request.delete(`${url}/1`));
  });
  describe('PUT /api/film/:id', () => {
    let createdFilms: any[];
  
    beforeAll(async () => {
      await prisma.persoon.createMany({ data: data.personen });
  
      // Create the films and ensure they are stored correctly in the database
      await prisma.films.createMany({ data: data.films });
  
      // Fetch the films after creating them to populate `createdFilms`
      createdFilms = await prisma.films.findMany();
    });
  
    afterAll(async () => {
      // Cleanup data after tests
      await prisma.film_Locatie.deleteMany();
      await prisma.film_Acteur.deleteMany();
      await prisma.awards.deleteMany();
      await prisma.locatie.deleteMany();
      await prisma.persoon.deleteMany();
      await prisma.films.deleteMany();
    });
  
    it('should 200 and update the film', async () => {
      expect(createdFilms.length).toBeGreaterThan(0); // Ensure films were created

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
        .set('Authorization', adminAuthHeader); // Assuming admin is authorized to update films

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        FilmID: createdFilms[0].FilmID,
        Naam: 'Inception Updated',
        Jaar: '2012',
        Duur: '150 min',
        Genre: 'Action',
        Rating: '9.0',
      });
      
      // Verify the data is updated in the database
      const updatedFilm = await prisma.films.findUnique({
        where: { FilmID: createdFilms[0].FilmID },
      });
      expect(updatedFilm).toMatchObject(updatedFilmData);
    });

    it('should 400 for invalid data', async () => {
      const invalidData = { Jaar: 'Invalid Year', Duur: -100 }; // Invalid data

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
        .set('Authorization', authHeader); // Regular user should not be allowed

      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({
        code: 'FORBIDDEN',
        message: 'You are not allowed to do this action',
      });
    });
    testAuthHeader(() => request.put(`${url}/1`));
  });
  describe('GET /api/film/:id', () => {
    let createdFilms: any[];
  
    beforeAll(async () => {
      await prisma.persoon.createMany({ data: data.personen });
      await prisma.films.createMany({ data: data.films });
  
      // Fetch the films after creating them to populate `createdFilms`
      createdFilms = await prisma.films.findMany();
    });
  
    afterAll(async () => {
      // Cleanup data after tests
      await prisma.film_Locatie.deleteMany();
      await prisma.film_Acteur.deleteMany();
      await prisma.awards.deleteMany();
      await prisma.locatie.deleteMany();
      await prisma.persoon.deleteMany();
      await prisma.films.deleteMany();
    });
    it('should 200 and return the requested film', async () => {
      const filmId = createdFilms[0].FilmID; // Get the ID of the created film
  
      const response = await request
        .get(`/api/film/${filmId}`)
        .set('Authorization', authHeader); // Adjust for your actual auth mechanism
  
      expect(response.statusCode).toBe(200);
    });
  
    it('should 404 when requesting a non-existing film', async () => {
      const response = await request
        .get('/api/film/999') // Non-existing film ID
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
        .get('/api/film/invalid') // Invalid ID format
        .set('Authorization', authHeader);
  
      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(response.body.details.params).toHaveProperty('id');
    });
    testAuthHeader(() => request.get('/api/film/1')); 
  });
});
