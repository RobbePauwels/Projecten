"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAdmin = exports.login = void 0;
const login = async (supertest) => {
    const response = await supertest.post('/api/sessions').send({
        email: 'test.user@hogent.be',
        password: '12345678',
    });
    if (response.statusCode !== 200) {
        throw new Error(response.body.message || 'Unknown error occured');
    }
    return `Bearer ${response.body.token}`;
};
exports.login = login;
const loginAdmin = async (supertest) => {
    const response = await supertest.post('/api/sessions').send({
        email: 'admin.user@hogent.be',
        password: '12345678',
    });
    if (response.statusCode !== 200) {
        throw new Error(response.body.message || 'Unknown error occured');
    }
    return `Bearer ${response.body.token}`;
};
exports.loginAdmin = loginAdmin;
