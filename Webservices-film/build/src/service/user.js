"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteById = exports.updateById = exports.getById = exports.getAll = exports.register = exports.login = exports.checkRole = exports.checkAndParseSession = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const serviceError_1 = __importDefault(require("../core/serviceError"));
const data_1 = require("../data");
const password_1 = require("../core/password");
const jwt_1 = require("../core/jwt");
const logging_1 = require("../core/logging");
const roles_1 = __importDefault(require("../core/roles"));
const _handleDBError_1 = __importDefault(require("./_handleDBError"));
const makeExposedUser = ({ id, naam, email }) => ({
    id,
    naam,
    email,
});
const checkAndParseSession = async (authHeader) => {
    if (!authHeader) {
        throw serviceError_1.default.unauthorized('You need to be signed in');
    }
    if (!authHeader.startsWith('Bearer ')) {
        throw serviceError_1.default.unauthorized('Invalid authentication token');
    }
    const authToken = authHeader.substring(7);
    try {
        const { roles, sub } = await (0, jwt_1.verifyJWT)(authToken);
        return {
            userId: Number(sub),
            roles,
        };
    }
    catch (error) {
        (0, logging_1.getLogger)().error(error.message, { error });
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw serviceError_1.default.unauthorized('The token has expired');
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw serviceError_1.default.unauthorized(`Invalid authentication token: ${error.message}`);
        }
        else {
            throw serviceError_1.default.unauthorized(error.message);
        }
    }
};
exports.checkAndParseSession = checkAndParseSession;
const checkRole = (role, roles) => {
    const hasPermission = roles.includes(role);
    if (!hasPermission) {
        throw serviceError_1.default.forbidden('You are not allowed to view this part of the application');
    }
};
exports.checkRole = checkRole;
const login = async (email, password) => {
    const user = await data_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw serviceError_1.default.unauthorized('The given email and password do not match');
    }
    const passwordValid = await (0, password_1.verifyPassword)(password, user.password_hash);
    if (!passwordValid) {
        throw serviceError_1.default.unauthorized('The given email and password do not match');
    }
    return await (0, jwt_1.generateJWT)(user);
};
exports.login = login;
const register = async ({ naam, email, password, }) => {
    try {
        const passwordHash = await (0, password_1.hashPassword)(password);
        const user = await data_1.prisma.user.create({
            data: {
                naam,
                email,
                password_hash: passwordHash,
                roles: [roles_1.default.USER],
            },
        });
        return await (0, jwt_1.generateJWT)(user);
    }
    catch (error) {
        throw (0, _handleDBError_1.default)(error);
    }
};
exports.register = register;
const getAll = async () => {
    const users = await data_1.prisma.user.findMany();
    return users.map(makeExposedUser);
};
exports.getAll = getAll;
const getById = async (id) => {
    const user = await data_1.prisma.user.findUnique({ where: { id } });
    if (!user) {
        throw serviceError_1.default.notFound('No user with this id exists');
    }
    return makeExposedUser(user);
};
exports.getById = getById;
const updateById = async (id, changes) => {
    try {
        const user = await data_1.prisma.user.update({
            where: { id },
            data: changes,
        });
        return makeExposedUser(user);
    }
    catch (error) {
        throw (0, _handleDBError_1.default)(error);
    }
};
exports.updateById = updateById;
const deleteById = async (id) => {
    try {
        await data_1.prisma.user.delete({ where: { id } });
    }
    catch (error) {
        throw (0, _handleDBError_1.default)(error);
    }
};
exports.deleteById = deleteById;
