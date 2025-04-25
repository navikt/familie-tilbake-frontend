import type { Request, Response, NextFunction } from 'express';

import crypto from 'crypto';

import { logError } from '../../logging/logging';

type CsrfTokenData = {
    token: string;
    opprettet: number;
};

const csrfTokens = new Map<string, CsrfTokenData>();
const MAKS_TOKEN_ALDER = 24 * 60 * 60 * 1000; // 1 dag
const IKKE_SIKRE_METODER = ['GET', 'HEAD', 'OPTIONS'];

export const genererCsrfToken = (sessionId: string) => {
    const token = crypto.randomUUID();
    csrfTokens.set(sessionId, { token, opprettet: Date.now() });
    return token;
};

const verifiserCsrfToken = (sessionId: string, mottattToken: string): boolean => {
    const tokenData = csrfTokens.get(sessionId);
    if (!tokenData) return false;

    const tokenAlder = Date.now() - tokenData.opprettet;
    if (tokenAlder > MAKS_TOKEN_ALDER) {
        csrfTokens.delete(sessionId);
        return false;
    }

    return tokenData.token === mottattToken;
};

export const fjernUtgåtteTokens = () => {
    for (const [sessionId, tokenData] of csrfTokens.entries()) {
        const tokenAlder = Date.now() - tokenData.opprettet;
        if (tokenAlder > MAKS_TOKEN_ALDER) {
            csrfTokens.delete(sessionId);
        }
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const csrfBeskyttelse = (req: Request, res: Response, next: NextFunction): any => {
    if (IKKE_SIKRE_METODER.includes(req.method)) {
        return next();
    }

    const sessionId = req.session.id;
    const csrfToken = req.headers['x-csrf-token'];

    if (!sessionId) {
        return res.status(401).json({ error: 'Ingen aktiv sesjon' });
    }

    if (!csrfToken || typeof csrfToken !== 'string') {
        return res.status(403).json({ error: 'CSRF-token mangler' });
    }

    if (!verifiserCsrfToken(sessionId, csrfToken)) {
        logError(`Ugyldig CSRF-token for sesjon ${sessionId}... IP= ${req.ip}`);
        return res.status(403).json({ error: 'Ugyldig CSRF-token' });
    }

    next();
};
