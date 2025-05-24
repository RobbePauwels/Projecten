"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteById = exports.create = exports.getById = exports.getAll = void 0;
const data_1 = require("../data");
const _handleDBError_1 = __importDefault(require("./_handleDBError"));
const serviceError_1 = __importDefault(require("../core/serviceError"));
const roles_1 = __importDefault(require("../core/roles"));
const PERSOON_SELECT = {
    PersoonID: true,
    Voornaam: true,
    Achternaam: true,
    GeboorteDatum: true,
    Land: true,
};
const getAll = async () => {
    return data_1.prisma.persoon.findMany();
};
exports.getAll = getAll;
const getById = async (PersoonID) => {
    const persoon = await data_1.prisma.persoon.findUnique({
        where: {
            PersoonID,
        },
    });
    if (!persoon) {
        throw serviceError_1.default.notFound('No person with this id exists');
    }
    return persoon;
};
exports.getById = getById;
const create = async (persoon) => {
    try {
        return await data_1.prisma.persoon.create({
            data: {
                Voornaam: persoon.Voornaam,
                Achternaam: persoon.Achternaam,
                GeboorteDatum: persoon.GeboorteDatum,
                Land: persoon.Land,
            },
            select: PERSOON_SELECT,
        });
    }
    catch (error) {
        throw (0, _handleDBError_1.default)(error);
    }
};
exports.create = create;
const deletePersonRelations = async (persoonID) => {
    await data_1.prisma.film_Acteur.deleteMany({
        where: {
            PersoonID: persoonID,
        },
    });
};
const deleteById = async (PersoonID, roles) => {
    if (!roles.includes(roles_1.default.ADMIN)) {
        throw serviceError_1.default.forbidden('You are not allowed to do this action');
    }
    await deletePersonRelations(PersoonID);
    await data_1.prisma.persoon.delete({
        where: {
            PersoonID,
        },
    });
};
exports.deleteById = deleteById;
