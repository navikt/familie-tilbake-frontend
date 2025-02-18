import winston from 'winston';
import { envVar } from './utils';

export enum LOG_LEVEL {
    ERROR = 3,
    WARNING = 2,
    INFO = 1,
    DEBUG = 0,
}

export type Meta = Record<string, unknown>;

export const stdoutLogger = winston.createLogger({
    format: winston.format.json(),
    level: envVar('LOG_LEVEL', false, 'info'),
    transports: [new winston.transports.Console()],
});

export const logInfo = (message: string, meta: Meta = {}) => {
    stdoutLogger.info(message, meta);
};

export const logError = (message: string, err?: Error, meta: Meta = {}) => {
    stdoutLogger.error(message, { ...meta, ...(err && { message: `: ${err?.message || err}` }) });
};
