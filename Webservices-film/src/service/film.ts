import { prisma } from '../data';
import type { Films, FilmCreateInput, Film, FilmUpdateInput} from '../types/film';
import handleDBError from './_handleDBError';
import ServiceError from '../core/serviceError';
import Role from '../core/roles';

const FILM_SELECT = {
  FilmID: true,
  Naam: true,
  Jaar: true,
  Duur: true,
  Genre: true, 
  Rating: true,
  RegisseurID: false, 
  addedByUserID: false,
  User: { // Include related user data
    select: {
      naam: true, // Select the 'naam' field of the related user
    },
  },
};

export const getAll = async (): Promise<Films[]> => {
  const films = await prisma.films.findMany({
    select: FILM_SELECT,
  });
  return films.map(({ User, ...film }) => ({
    ...film,
    'Toegevoegd door': User?.naam || null, // Voeg het 'Toegevoegd door'-veld toe
  }));
};

export const getFilmById = async (id: number) => {
  const film = await prisma.films.findUnique({
    where: {
      FilmID: id,  // Zoek naar de film op basis van FilmID
    },
    include: {
      Awards: {
        select: {
          Naam: true,
          Jaar: true,
        },
      },
      Acteurs: {
        include: {
          Persoon: {
            select: {
              Voornaam: true,
              Achternaam: true,
              GeboorteDatum: true,
              Land: true,
            },
          },
          // We verwijderen de Acteur ID en tonen alleen de relatie met Persoon en Rol
        },
      },
      Locaties: {
        include: {
          Locatie: {
            select: {
              Straat: true,
              Stad: true,
              Land: true,
              // Geen 'Foto' toevoegen aan de Locatie
            },
          },
        },
      },
      Regisseur: {
        select: {
          Voornaam: true,
          Achternaam: true,
          GeboorteDatum: true,
          Land: true,
        },
      },
    },
  });

  if (!film) {
    throw ServiceError.notFound(`Geen film gevonden met FilmID ${id}`);
  }

  const { Acteurs, Locaties, ...restFilm } = film;

  // Herstructureren van Acteurs: Voeg 'Rol' toe aan Persoon
  const formattedActeurs = Acteurs.map((acteur) => ({
    ...acteur.Persoon,  // Alle gegevens van Persoon
    Rol: acteur.Rol,     // Voeg de Rol toe aan Persoon
  }));

  // Herstructureren van Locaties: Verwijder 'Foto' van de Locatie
  const formattedLocaties = Locaties.map((loc) => loc.Locatie);

  // Retourneer het aangepaste filmobject
  return {
    ...restFilm, // Alle overige gegevens van film (behalve Acteurs en Locaties)
    Acteurs: formattedActeurs, // Gebruik de geherstructureerde Acteurs
    Locaties: formattedLocaties, // Gebruik de geherstructureerde Locaties
  };
};
export const create = async ({
  Naam, Jaar, Duur, Genre, Rating, RegisseurID, Acteurs, Awards, Locaties,  
  // AddedByUserID is now passed inside the object
}: FilmCreateInput & {
  Acteurs?: ({ PersoonID: number; Rol: string; } |
  {
    Voornaam: string; Achternaam: string; GeboorteDatum: string; Land: string; Rol: string;
  })[];
  Awards?: { Naam: string; Jaar: string; }[];
  Locaties?: ({ LocatieID: number; } | { Straat: string; Stad: string; Land: string; })[];
}, addedByUserID: number): Promise<Film> => {
  try {
    return await prisma.$transaction(async (prisma) => {
      // Step 1: Create the film

      const newFilm = await prisma.films.create({
        data: {
          Naam,
          Jaar,
          Duur,
          Genre,
          Rating,
          RegisseurID,
          addedByUserID, // Use AddedByUserID passed from the session
        },
        select: FILM_SELECT,
      });

      // Step 2: Add actors
      if (Acteurs && Acteurs.length > 0) {
        for (const acteur of Acteurs) {
          if ('PersoonID' in acteur) {
            // Existing actor association
            await prisma.film_Acteur.create({
              data: {
                FilmID: newFilm.FilmID,
                PersoonID: acteur.PersoonID,
                Rol: acteur.Rol, // Store the role in the junction table
              },
            });
          } else {
            // Create and associate a new actor
            const newActeur = await prisma.persoon.create({
              data: {
                Voornaam: acteur.Voornaam,
                Achternaam: acteur.Achternaam,
                GeboorteDatum: acteur.GeboorteDatum,
                Land: acteur.Land,
              },
            });
            await prisma.film_Acteur.create({
              data: {
                FilmID: newFilm.FilmID,
                PersoonID: newActeur.PersoonID,
                Rol: acteur.Rol, // Store the role in the junction table
              },
            });
          }
        }
      }

      // Step 3: Add awards
      if (Awards && Awards.length > 0) {
        await prisma.awards.createMany({
          data: Awards.map((award) => ({
            FilmID: newFilm.FilmID,
            Naam: award.Naam,
            Jaar: award.Jaar,
          })),
        });
      }

      // Step 4: Add locations
      if (Locaties && Locaties.length > 0) {
        for (const locatie of Locaties) {
          if ('LocatieID' in locatie) {
            // Existing location association
            await prisma.film_Locatie.create({
              data: {
                FilmID: newFilm.FilmID,
                LocatieID: locatie.LocatieID,
              },
            });
          } else {
            // Create and associate a new location
            const newLocatie = await prisma.locatie.create({
              data: {
                Straat: locatie.Straat,
                Stad: locatie.Stad,
                Land: locatie.Land,
              },
            });
            await prisma.film_Locatie.create({
              data: {
                FilmID: newFilm.FilmID,
                LocatieID: newLocatie.LocatieID,
              },
            });
          }
        }
      }

      return newFilm;
    });
  } catch (error: any) {
    throw handleDBError(error);
  }
};

export const updateById = async (
  FilmID: number,
  {
    Naam,
    Jaar,
    Duur,
    Genre,
    Rating,
    RegisseurID,
    Acteurs,
    Awards,
    Locaties,
  }: FilmUpdateInput & {
    Acteurs?: { PersoonID?: number; Rol: string; Voornaam?: string; Achternaam?: 
    string; GeboorteDatum?: string; Land?: string }[];
    Awards?: { Naam: string; Jaar: string }[];
    Locaties?: { Straat: string; Stad: string; Land: string }[];
  }, roles: string[]): Promise<Film> => {
  if(!roles.includes(Role.ADMIN)){
    throw ServiceError.forbidden('You are not allowed to do this action');
  }
  return prisma.$transaction(async (prisma) => {
    // Stap 1: Update de filmgegevens
    const updatedFilm = await prisma.films.update({
      where: { FilmID },
      data: { Naam, Jaar, Duur, Genre, Rating, RegisseurID },
      select: FILM_SELECT,
    });

    // Stap 2: Acteurs koppelen
    if (Acteurs && Acteurs.length > 0) {
      // Verwijder bestaande koppelingen van de film met acteurs
      await prisma.film_Acteur.deleteMany({ where: { FilmID } });

      // Voeg nieuwe acteurs toe indien nodig en koppel ze aan de film
      const acteurData = await Promise.all(
        Acteurs.map(async (acteur) => {
          // Als de acteur geen PersoonID heeft, voeg deze dan toe
          if (!acteur.PersoonID) {
            const newActeur = await prisma.persoon.create({
              data: {
                Voornaam: acteur.Voornaam!,
                Achternaam: acteur.Achternaam!,
                GeboorteDatum: acteur.GeboorteDatum!,
                Land: acteur.Land!,
              },
            });
            acteur.PersoonID = newActeur.PersoonID;
          }

          // Koppel de acteur aan de film
          return {
            FilmID,
            PersoonID: acteur.PersoonID!,
            Rol: acteur.Rol,
          };
        }),
      );

      // Voeg de nieuwe koppelingen toe
      await prisma.film_Acteur.createMany({
        data: acteurData,
      });
    }

    // Stap 3: Awards koppelen (optioneel)
    if (Awards && Awards.length > 0) {
      await prisma.awards.deleteMany({ where: { FilmID } });
      await prisma.awards.createMany({
        data: Awards.map((award) => ({
          Naam: award.Naam,
          Jaar: award.Jaar,
          FilmID,
        })),
      });
    }

    // Stap 4: Locaties koppelen (optioneel)
    if (Locaties && Locaties.length > 0) {
      // Voeg nieuwe locaties toe en koppel ze aan de film
      const locatieData = await Promise.all(
        Locaties.map(async (locatie) => {
          // Controleer of de locatie al bestaat
          const existingLocatie = await prisma.locatie.findFirst({
            where: {
              Straat: locatie.Straat,
              Stad: locatie.Stad,
              Land: locatie.Land,
            },
          });

          // Gebruik bestaande locatie of maak een nieuwe
          const locatieID =
            existingLocatie?.LocatieID ||
            (
              await prisma.locatie.create({
                data: {
                  Straat: locatie.Straat,
                  Stad: locatie.Stad,
                  Land: locatie.Land,
                },
              })
            ).LocatieID;

          return { FilmID, LocatieID: locatieID };
        }),
      );

      // Koppel de locaties aan de film
      await prisma.film_Locatie.deleteMany({ where: { FilmID } });
      await prisma.film_Locatie.createMany({ data: locatieData });
    }

    return updatedFilm;
  });
};

export const deleteById = async (FilmID: number, roles:string[]): Promise<void> => {
  if(!roles.includes(Role.ADMIN)){
    throw ServiceError.forbidden('You are not allowed to do this action');
  }

  // Verwijder eerst gerelateerde gegevens
  await prisma.film_Acteur.deleteMany({
    where: {
      FilmID: FilmID,
    },
  });
  await prisma.awards.deleteMany({
    where: {
      FilmID: FilmID,
    },
  });
  await prisma.film_Locatie.deleteMany({
    where: {
      FilmID: FilmID,
    },
  });
  
  // Verwijder dan de film zelf
  await prisma.films.delete({
    where: { FilmID: FilmID },
  });
};

