import type { Request, Response, NextFunction } from 'express';
import type { Session } from 'express-session';

import crypto from 'crypto';

import { logError } from '../../logging/logging';

const IKKE_SIKRE_METODER = ['GET', 'HEAD', 'OPTIONS'];

export const genererCsrfToken = (session: Session) => {
    session.csrfToken = crypto.randomUUID();
    return session.csrfToken;
};

const verifiserCsrfToken = ({ csrfToken }: Session, mottattToken: string): boolean => {
    if (!csrfToken) {
        return false;
    }
    return csrfToken === mottattToken;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const csrfBeskyttelse = (req: Request, res: Response, next: NextFunction): any => {
    if (IKKE_SIKRE_METODER.includes(req.method)) {
        return next();
    }

    const csrfToken = req.headers['x-csrf-token'];

    if (!csrfToken || typeof csrfToken !== 'string') {
        return res.status(403).json({ error: 'CSRF-token mangler' });
    }

    if (!verifiserCsrfToken(req.session, csrfToken)) {
        logError(`Ugyldig CSRF-token for sesjon ${req.sessionID}... IP= ${req.ip}`);
        return res.status(403).json({ error: 'Ugyldig CSRF-token' });
    }

    return next();
};
