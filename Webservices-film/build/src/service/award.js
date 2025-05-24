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
const AWARD_SELECT = {
    AwardID: true,
    Naam: true,
    Jaar: true,
    FilmID: true,
};
const getAll = async () => {
    return data_1.prisma.awards.findMany();
};
exports.getAll = getAll;
const getById = async (AwardID) => {
    const award = await data_1.prisma.awards.findUnique({
        where: {
            AwardID,
        },
    });
    if (!award) {
        throw serviceError_1.default.notFound('Er bestaat geen award met dit ID');
    }
    return award;
};
exports.getById = getById;
const create = async (award) => {
    try {
        return await data_1.prisma.awards.create({
            data: {
                Naam: award.Naam,
                Jaar: award.Jaar,
                FilmID: award.FilmID,
            },
            select: AWARD_SELECT,
        });
    }
    catch (error) {
        throw (0, _handleDBError_1.default)(error);
    }
};
exports.create = create;
const deleteById = async (AwardID, roles) => {
    if (!roles.includes(roles_1.default.ADMIN)) {
        throw serviceError_1.default.forbidden('You are not allowed to do this action');
    }
    await data_1.prisma.awards.delete({
        where: {
            AwardID,
        },
    });
};
exports.deleteById = deleteById;
