import winston from 'winston';

export enum LogLevel {
    Error = 3,
    Warning = 2,
    Info = 1,
    Debug = 0,
}

export type Meta = Record<string, unknown>;

export const stdoutLogger = winston.createLogger({
    format: winston.format.json(),
    // Kan ikke skje via appConfig siden den har en avhengighet til logg
    level: process.env.LOG_LEVEL ?? 'info',
    transports: [new winston.transports.Console()],
});

export const logDebug = (message: string, meta: Meta = {}): void => {
    stdoutLogger.debug(message, meta);
};

export const logInfo = (message: string, meta: Meta = {}): void => {
    stdoutLogger.info(message, meta);
};

export const logWarn = (message: string, meta: Meta = {}): void => {
    stdoutLogger.warn(message, meta);
};

export const logError = (message: string, err?: Error, meta: Meta = {}): void => {
    stdoutLogger.error(message, { ...meta, ...(err && { message: `: ${err?.message || err}` }) });
};
