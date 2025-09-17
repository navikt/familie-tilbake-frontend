import type { Request, Response, NextFunction } from 'express';
import type { Session } from 'express-session';

import crypto from 'crypto';

import { logError } from '../../logging/logging';

const IKKE_SIKRE_METODER = ['GET', 'HEAD', 'OPTIONS'];
const MAKS_GYLDIGE_CSRF_TOKENS = 5;

export const genererCsrfToken = (session: Session): string => {
    if (!session.gyldigeCsrfTokens) {
        session.gyldigeCsrfTokens = [];
    }

    const nyttToken = crypto.randomUUID();
    session.csrfToken = nyttToken;
    session.gyldigeCsrfTokens.push(nyttToken);

    if (session.gyldigeCsrfTokens.length >= MAKS_GYLDIGE_CSRF_TOKENS) {
        session.gyldigeCsrfTokens.shift();
    }

    return session.csrfToken;
};

const verifiserCsrfToken = (session: Session, mottattToken: string): boolean => {
    if (!session.csrfToken || session.gyldigeCsrfTokens?.length === 0) {
        return false;
    }

    if (session.csrfToken === mottattToken) {
        return true;
    }

    return session.gyldigeCsrfTokens.includes(mottattToken);
};

export const csrfBeskyttelse = (req: Request, res: Response, next: NextFunction): void => {
    if (IKKE_SIKRE_METODER.includes(req.method)) {
        next();
        return;
    }

    const csrfToken = req.headers['x-csrf-token'];

    if (!csrfToken || typeof csrfToken !== 'string') {
        res.status(403).json({
            frontendFeilmelding: 'CSRF-token mangler. Prøv å laste siden på nytt.',
            status: 'IKKE_TILGANG',
        });
        return;
    }

    if (typeof csrfToken === 'string' && !verifiserCsrfToken(req.session, csrfToken)) {
        logError(
            `Ugyldig CSRF-token for sesjon ${req.sessionID}... IP= ${req.ip}, CSRF-tokenstart=${csrfToken.substring(0, 4)}, path=${req.path}`
        );
        res.status(403).json({
            frontendFeilmelding:
                'Ugyldig CSRF-token. Ta vare på ulagret data og last inn siden på nytt.',
            status: 'IKKE_TILGANG',
        });
        return;
    }

    next();
};
