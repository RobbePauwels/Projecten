"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteById = exports.create = exports.getById = exports.getAll = void 0;
const serviceError_1 = __importDefault(require("../core/serviceError"));
const data_1 = require("../data");
const roles_1 = __importDefault(require("../core/roles"));
const getAll = async () => {
    return data_1.prisma.locatie.findMany();
};
exports.getAll = getAll;
const getById = async (LocatieID) => {
    const place = await data_1.prisma.locatie.findUnique({
        where: {
            LocatieID,
        },
    });
    if (!place) {
        throw serviceError_1.default.notFound('Er bestaat geen locatie met dit ID');
    }
    return place;
};
exports.getById = getById;
const create = async (locatie) => {
    return data_1.prisma.locatie.create({
        data: {
            Straat: locatie.Straat,
            Stad: locatie.Stad,
            Land: locatie.Land,
            Foto: '',
        },
    });
};
exports.create = create;
const deleteById = async (LocatieID, roles) => {
    if (!roles.includes(roles_1.default.ADMIN)) {
        throw serviceError_1.default.forbidden('You are not allowed to do this action');
    }
    await data_1.prisma.locatie.delete({
        where: {
            LocatieID,
        },
    });
};
exports.deleteById = deleteById;
