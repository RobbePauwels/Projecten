"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteById = exports.updateById = exports.create = exports.getFilmById = exports.getAll = void 0;
const data_1 = require("../data");
const _handleDBError_1 = __importDefault(require("./_handleDBError"));
const serviceError_1 = __importDefault(require("../core/serviceError"));
const roles_1 = __importDefault(require("../core/roles"));
const FILM_SELECT = {
    FilmID: true,
    Naam: true,
    Jaar: true,
    Duur: true,
    Genre: true,
    Rating: true,
    RegisseurID: false,
};
const getAll = async () => {
    return data_1.prisma.films.findMany({
        select: FILM_SELECT,
    });
};
exports.getAll = getAll;
const getFilmById = async (id) => {
    const film = await data_1.prisma.films.findUnique({
        where: {
            FilmID: id,
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
                },
            },
            Locaties: {
                include: {
                    Locatie: {
                        select: {
                            Straat: true,
                            Stad: true,
                            Land: true,
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
        throw serviceError_1.default.notFound(`Geen film gevonden met FilmID ${id}`);
    }
    const { Acteurs, Locaties, ...restFilm } = film;
    const formattedActeurs = Acteurs.map((acteur) => ({
        ...acteur.Persoon,
        Rol: acteur.Rol,
    }));
    const formattedLocaties = Locaties.map((loc) => loc.Locatie);
    return {
        ...restFilm,
        Acteurs: formattedActeurs,
        Locaties: formattedLocaties,
    };
};
exports.getFilmById = getFilmById;
const create = async ({ Naam, Jaar, Duur, Genre, Rating, RegisseurID, Acteurs, Awards, Locaties, }) => {
    try {
        return await data_1.prisma.$transaction(async (prisma) => {
            const newFilm = await prisma.films.create({
                data: {
                    Naam,
                    Jaar,
                    Duur,
                    Genre,
                    Rating,
                    RegisseurID,
                },
                select: FILM_SELECT,
            });
            if (Acteurs && Acteurs.length > 0) {
                for (const acteur of Acteurs) {
                    if ('PersoonID' in acteur) {
                        await prisma.film_Acteur.create({
                            data: {
                                FilmID: newFilm.FilmID,
                                PersoonID: acteur.PersoonID,
                                Rol: acteur.Rol,
                            },
                        });
                    }
                    else {
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
                                Rol: acteur.Rol,
                            },
                        });
                    }
                }
            }
            if (Awards && Awards.length > 0) {
                await prisma.awards.createMany({
                    data: Awards.map((award) => ({
                        FilmID: newFilm.FilmID,
                        Naam: award.Naam,
                        Jaar: award.Jaar,
                    })),
                });
            }
            if (Locaties && Locaties.length > 0) {
                for (const locatie of Locaties) {
                    if ('LocatieID' in locatie) {
                        await prisma.film_Locatie.create({
                            data: {
                                FilmID: newFilm.FilmID,
                                LocatieID: locatie.LocatieID,
                            },
                        });
                    }
                    else {
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
    }
    catch (error) {
        throw (0, _handleDBError_1.default)(error);
    }
};
exports.create = create;
const updateById = async (FilmID, { Naam, Jaar, Duur, Genre, Rating, RegisseurID, Acteurs, Awards, Locaties, }, roles) => {
    if (!roles.includes(roles_1.default.ADMIN)) {
        throw serviceError_1.default.forbidden('You are not allowed to do this action');
    }
    return data_1.prisma.$transaction(async (prisma) => {
        const updatedFilm = await prisma.films.update({
            where: { FilmID },
            data: { Naam, Jaar, Duur, Genre, Rating, RegisseurID },
            select: FILM_SELECT,
        });
        if (Acteurs && Acteurs.length > 0) {
            await prisma.film_Acteur.deleteMany({ where: { FilmID } });
            const acteurData = await Promise.all(Acteurs.map(async (acteur) => {
                if (!acteur.PersoonID) {
                    const newActeur = await prisma.persoon.create({
                        data: {
                            Voornaam: acteur.Voornaam,
                            Achternaam: acteur.Achternaam,
                            GeboorteDatum: acteur.GeboorteDatum,
                            Land: acteur.Land,
                        },
                    });
                    acteur.PersoonID = newActeur.PersoonID;
                }
                return {
                    FilmID,
                    PersoonID: acteur.PersoonID,
                    Rol: acteur.Rol,
                };
            }));
            await prisma.film_Acteur.createMany({
                data: acteurData,
            });
        }
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
        if (Locaties && Locaties.length > 0) {
            const locatieData = await Promise.all(Locaties.map(async (locatie) => {
                const existingLocatie = await prisma.locatie.findFirst({
                    where: {
                        Straat: locatie.Straat,
                        Stad: locatie.Stad,
                        Land: locatie.Land,
                    },
                });
                const locatieID = existingLocatie?.LocatieID ||
                    (await prisma.locatie.create({
                        data: {
                            Straat: locatie.Straat,
                            Stad: locatie.Stad,
                            Land: locatie.Land,
                        },
                    })).LocatieID;
                return { FilmID, LocatieID: locatieID };
            }));
            await prisma.film_Locatie.deleteMany({ where: { FilmID } });
            await prisma.film_Locatie.createMany({ data: locatieData });
        }
        return updatedFilm;
    });
};
exports.updateById = updateById;
const deleteById = async (FilmID, roles) => {
    if (!roles.includes(roles_1.default.ADMIN)) {
        throw serviceError_1.default.forbidden('You are not allowed to do this action');
    }
    await data_1.prisma.film_Acteur.deleteMany({
        where: {
            FilmID: FilmID,
        },
    });
    await data_1.prisma.awards.deleteMany({
        where: {
            FilmID: FilmID,
        },
    });
    await data_1.prisma.film_Locatie.deleteMany({
        where: {
            FilmID: FilmID,
        },
    });
    await data_1.prisma.films.delete({
        where: { FilmID: FilmID },
    });
};
exports.deleteById = deleteById;
