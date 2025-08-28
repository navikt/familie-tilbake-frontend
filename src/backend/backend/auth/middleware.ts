import type { Request, Response, NextFunction } from 'express';
import type { Session } from 'express-session';

import crypto from 'crypto';

import { logError } from '../../logging/logging';

const IKKE_SIKRE_METODER = ['GET', 'HEAD', 'OPTIONS'];

export const genererCsrfToken = (session: Session): string => {
    session.csrfToken = crypto.randomUUID();
    return session.csrfToken;
};

const verifiserCsrfToken = ({ csrfToken }: Session, mottattToken: string): boolean => {
    if (!csrfToken) {
        return false;
    }
    return csrfToken === mottattToken;
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
            `Ugyldig CSRF-token for sesjon ${req.sessionID}... IP= ${req.ip}, CSRF-tokenstart=${csrfToken.substring(0, 4)}`
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
