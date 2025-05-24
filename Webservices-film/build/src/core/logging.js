"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogger = void 0;
const config_1 = __importDefault(require("config"));
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, colorize, printf } = winston_1.default.format;
const NODE_ENV = config_1.default.get('env');
const LOG_LEVEL = config_1.default.get('log.level');
const LOG_DISABLED = config_1.default.get('log.disabled');
const loggerFormat = () => {
    const formatMessage = ({ level, message, timestamp, ...rest }) => {
        return `${timestamp} | ${level} | ${message} | ${JSON.stringify(rest)}`;
    };
    const formatError = ({ error, ...rest }) => {
        if (error instanceof Error) {
            return `${formatMessage(rest)}\n\n${error.stack}\n`;
        }
        return `${formatMessage(rest)}\n\n[Unknown Error: ${JSON.stringify(error)}]\n`;
    };
    const format = (info) => {
        if (info?.['error'] instanceof Error) {
            return formatError(info);
        }
        return formatMessage(info);
    };
    return combine(colorize(), timestamp(), printf(format));
};
const rootLogger = winston_1.default.createLogger({
    level: LOG_LEVEL,
    format: loggerFormat(),
    defaultMeta: {
        env: NODE_ENV,
    },
    transports: NODE_ENV === 'testing'
        ? [
            new winston_1.default.transports.File({
                filename: 'test.log',
                silent: LOG_DISABLED,
            }),
        ]
        : [new winston_1.default.transports.Console({ silent: LOG_DISABLED })],
});
const getLogger = () => {
    return rootLogger;
};
exports.getLogger = getLogger;
