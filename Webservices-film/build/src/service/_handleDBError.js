"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serviceError_1 = __importDefault(require("../core/serviceError"));
const handleDBError = (error) => {
    const { code = '', message } = error;
    if (code === 'P2002') {
        switch (true) {
            case message.includes('idx_film_naam_unique'):
                throw serviceError_1.default.validationFailed('A film with this name already exists');
            case message.includes('idx_persoon_email_unique'):
                throw serviceError_1.default.validationFailed('There is already a person with this email address');
            case message.includes('idx_locatie_straat_stad_land_unique'):
                throw serviceError_1.default.validationFailed('A place with this street, city, and country already exists');
            default:
                throw serviceError_1.default.validationFailed('This item already exists');
        }
    }
    if (code === 'P2025') {
        switch (true) {
            case message.includes('fk_film_regisseur'):
                throw serviceError_1.default.notFound('This director does not exist');
            case message.includes('fk_film_acteur'):
                throw serviceError_1.default.notFound('This actor does not exist in the film');
            case message.includes('fk_film_locatie'):
                throw serviceError_1.default.notFound('This location does not exist for the film');
            case message.includes('user'):
                throw serviceError_1.default.notFound('No user with this ID exists');
            case message.includes('film'):
                throw serviceError_1.default.notFound('No film with this ID exists');
            case message.includes('persoon'):
                throw serviceError_1.default.notFound('No person with this ID exists');
        }
    }
    if (code === 'P2003') {
        switch (true) {
            case message.includes('film_id'):
                throw serviceError_1.default.conflict('This film does not exist or is still linked to other records');
            case message.includes('persoon_id'):
                throw serviceError_1.default.conflict('This person does not exist or is still linked to other films');
            case message.includes('locatie_id'):
                throw serviceError_1.default.conflict('This location does not exist or is still linked to films');
        }
    }
    throw error;
};
exports.default = handleDBError;
