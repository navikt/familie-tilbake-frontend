import fs from 'fs';
import winston from 'winston';

import { envVar } from '../utils';

export enum LogLevel {
    Error = 3,
    Warning = 2,
    Info = 1,
    Debug = 0,
}

export type Meta = Record<string, unknown>;

const secureLogPath = () =>
    fs.existsSync('/secure-logs/') ? '/secure-logs/secure.log' : './secure.log';

export const stdoutLogger = winston.createLogger({
    format: winston.format.json(),
    level: envVar('LOG_LEVEL', false, 'info'),
    transports: [new winston.transports.Console()],
});

export const secureLogger = winston.createLogger({
    format: winston.format.json(),
    level: 'info',
    transports: [new winston.transports.File({ filename: secureLogPath(), maxsize: 5242880 })],
});

export const logDebug = (message: string, meta: Meta = {}) => {
    stdoutLogger.debug(message, meta);
};

export const logInfo = (message: string, meta: Meta = {}) => {
    stdoutLogger.info(message, meta);
};

export const logWarn = (message: string, meta: Meta = {}) => {
    stdoutLogger.warn(message, meta);
};

export const logError = (message: string, err?: Error, meta: Meta = {}) => {
    stdoutLogger.error(message, { ...meta, ...(err && { message: `: ${err?.message || err}` }) });
};

export const logSecure = (message: string, meta: Meta = {}) => {
    secureLogger.info(message, meta);
};
