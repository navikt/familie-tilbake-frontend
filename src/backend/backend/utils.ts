import type { Request } from 'express';

import { LogLevel, logDebug, logError, logInfo, logWarn } from '../logging/logging';

const prefix = (req: Request) => {
    return `${
        req.session && req.session.user
            ? `${req.session.user.displayName} -`
            : 'ugyldig sesjon eller mangler brukers data -'
    } ${req.method} - ${req.originalUrl}`;
};

export const logRequest = (req: Request, message: string, level: LogLevel) => {
    const melding = `${prefix(req)}: ${message}`;
    const callId = req.header('nav-call-id');
    const requestId = req.header('x-request-id');

    const meta = {
        ...(callId ? { x_callId: callId } : {}),
        ...(requestId ? { x_requestId: requestId } : {}),
    };
    switch (level) {
        case LogLevel.Debug:
            logDebug(melding, meta);
            break;
        case LogLevel.Info:
            logInfo(melding, meta);
            break;
        case LogLevel.Warning:
            logWarn(melding, meta);
            break;
        case LogLevel.Error:
            logError(melding, undefined, meta);
            break;
        default:
            logInfo(melding, meta);
    }
};

let erForbindelsenTilRedisTilgjengelig = true;

export const hentErforbindelsenTilRedisTilgjengelig = (): boolean => {
    return erForbindelsenTilRedisTilgjengelig;
};

export const settErforbindelsenTilRedisTilgjengelig = (verdi: boolean) => {
    erForbindelsenTilRedisTilgjengelig = verdi;
};
