"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    coverageProvider: 'v8',
    preset: 'ts-jest',
    testMatch: [
        '**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)',
    ],
    collectCoverageFrom: [
        './src/service/**/*.ts',
        './src/rest/**/*.ts',
    ],
    coverageDirectory: '__tests__/coverage',
};
exports.default = config;
