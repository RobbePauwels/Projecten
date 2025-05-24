// src/data/seed.ts
import { PrismaClient } from '@prisma/client'; 
import { hashPassword } from '../core/password';

const prisma = new PrismaClient(); // 👈 1

// 👇 2
async function main() {
  // Stap 1: Seed films
  const passwordHash = await hashPassword('12345678');

  await prisma.user.create({
    data: {
      id: 2,
      naam: 'testgebruiker',
      email: 'test.gebruiker@hogent.be',
      password_hash: passwordHash,
      roles: ['user'],
    },
  });
  await prisma.user.create({
    data: {
      id: 1,
      naam: 'Robbe Pauwels',
      email: 'robbe.pauwels2@student.hogent.be',
      password_hash: passwordHash,        
      roles: ['admin', 'user'],
    },
  });

  const spidermanFilm = await prisma.films.create({
    data: {
      Naam: 'Spiderman No Way Home',
      Jaar: '2021',
      Duur: '148 min',
      Genre: 'SiFi/Actie',
      Rating: '8.2',
    },
  });
  
  const starWarsFilm = await prisma.films.create({
    data: {
      Naam: 'Star Wars: A New Hope',
      Jaar: '1977',
      Duur: '121 min',
      Genre: 'SiFi/Actie',
      Rating: '8.6',
    },
  });
  
  // Stap 2: Seed Persoon (acteurs)
  const persoon1 = await prisma.persoon.create({
    data: {
      Voornaam: 'Tom',
      Achternaam: 'Holland',
      GeboorteDatum: '1996-06-01',
      Land: 'Verenigd Koninkrijk',
    },
  });
  
  const persoon2 = await prisma.persoon.create({
    data: {
      Voornaam: 'Mark',
      Achternaam: 'Hamill',
      GeboorteDatum: '1951-09-25',
      Land: 'Verenigde Staten',
    },
  });

  const persoon3 = await prisma.persoon.create({
    data: {
      Voornaam: 'Benedict',
      Achternaam: 'Cumberbatch',
      GeboorteDatum: '1976-07-19',
      Land: 'Verenigd Koninkrijk',
    },
  });
  
  // Stap 3: Seed regisseurs
  const regisseur1 = await prisma.persoon.create({
    data: {
      Voornaam: 'Jon',
      Achternaam: 'Watts',
      GeboorteDatum: '1981-06-28',
      Land: 'Verenigde Staten',
    },
  });
  
  const regisseur2 = await prisma.persoon.create({
    data: {
      Voornaam: 'George',
      Achternaam: 'Lucas',
      GeboorteDatum: '1944-05-14',
      Land: 'Verenigde Staten',
    },
  });
  
  // Stap 4: Koppel actoren aan de films
  await prisma.film_Acteur.createMany({
    data: [
      { FilmID: spidermanFilm.FilmID, PersoonID: persoon1.PersoonID, Rol: 'Peter Parker aka Spiderman' },
      { FilmID: spidermanFilm.FilmID, PersoonID: persoon3.PersoonID, Rol: 'Stephen Strange' },
      { FilmID: starWarsFilm.FilmID, PersoonID: persoon2.PersoonID, Rol: 'Luke Skywalker' },
    ],
  });
  
  // Stap 5: Koppel regisseurs aan de films
  await prisma.films.update({
    where: {
      FilmID: spidermanFilm.FilmID,
    },
    data: {
      RegisseurID: regisseur1.PersoonID,
    },
  });
  
  await prisma.films.update({
    where: {
      FilmID: starWarsFilm.FilmID,
    },
    data: {
      RegisseurID: regisseur2.PersoonID,
    },
  });
  
  // Stap 6: Seed awards (prijzen) voor de films
  await prisma.awards.createMany({
    data: [
      {
        Naam: 'Best Visual Effects',
        Jaar: '2022',
        FilmID: spidermanFilm.FilmID,
      },
      {
        Naam: 'Best Cinematography',
        Jaar: '1978',
        FilmID: starWarsFilm.FilmID,
      },
    ],
  });
  
  // Stap 7: Seed locaties (waar de films werden opgenomen)
  const locatie1 = await prisma.locatie.create({
    data: {
      Straat: 'Statue Of Liberty',
      Stad: 'New York',
      Land: 'Verenigde Staten',
      Foto: 'link_to_photo_1.jpg',
    },
  });
  
  const locatie2 = await prisma.locatie.create({
    data: {
      Straat: 'Death Valley National Park',
      Stad: 'California',
      Land: 'Verenigde Staten',
      Foto: 'link_to_photo_2.jpg',
    },
  });
  
  // Stap 8: Koppel films met locaties
  await prisma.film_Locatie.createMany({
    data: [
      { FilmID: spidermanFilm.FilmID, LocatieID: locatie1.LocatieID },
      { FilmID: starWarsFilm.FilmID, LocatieID: locatie2.LocatieID },
    ],
  });

  console.log('Films, actoren, regisseurs, awards en locaties zijn toegevoegd.');
}
// 👇 3
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
