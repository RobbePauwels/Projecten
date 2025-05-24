// src/core/logging.ts
import config from 'config';
import winston from 'winston';
const { combine, timestamp, colorize, printf } = winston.format;

const NODE_ENV = config.get<string>('env');
const LOG_LEVEL = config.get<string>('log.level');
const LOG_DISABLED = config.get<boolean>('log.disabled');

// 👇 1
const loggerFormat = () => {
  // 👇 2
  const formatMessage = ({
    level,
    message,
    timestamp,
    ...rest
  }: winston.Logform.TransformableInfo) => {
    return `${timestamp} | ${level} | ${message} | ${JSON.stringify(rest)}`;
  };

  /*
  const formatError = ({
    error: { stack },
    ...rest
  }: winston.Logform.TransformableInfo) =>
    `${formatMessage(rest)}\n\n${stack}\n`;

  */
  const formatError = ({
    error,
    ...rest
  }: winston.Logform.TransformableInfo) => {
    if (error instanceof Error) {
      // Safely access 'stack' because 'error' is now narrowed to 'Error'
      return `${formatMessage(rest)}\n\n${error.stack}\n`;
    }
    // Fallback if 'error' is not an instance of 'Error'
    return `${formatMessage(rest)}\n\n[Unknown Error: ${JSON.stringify(error)}]\n`;
  };
  const format = (info: winston.Logform.TransformableInfo) => {
    // 👇 5
    if (info?.['error'] instanceof Error) {
      return formatError(info);
    }

    return formatMessage(info); // 👈 6
  };

  return combine(colorize(), timestamp(), printf(format));
};

const rootLogger: winston.Logger = winston.createLogger({
  level: LOG_LEVEL, 
  format: loggerFormat(),
  defaultMeta: {
    env: NODE_ENV,
  },
  transports:
    NODE_ENV === 'testing'
      ? [
        new winston.transports.File({
          filename: 'test.log',
          silent: LOG_DISABLED,
        }),
      ]
      : [new winston.transports.Console({ silent: LOG_DISABLED })],
});

export const getLogger = () => {
  return rootLogger;
};
