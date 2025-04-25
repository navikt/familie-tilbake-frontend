import type { ISessionKonfigurasjon } from '../typer';
import type { Express, NextFunction, Request, Response } from 'express';

import { RedisStore } from 'connect-redis';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import session from 'express-session';
import redis from 'redis';

import { appConfig } from '../../config';
import { logError, logInfo } from '../../logging/logging';
import {
    hentErforbindelsenTilValkeyTilgjengelig,
    settErforbindelsenTilValkeyTilgjengelig,
} from '../utils';

const redisClientForAiven = (sessionKonfigurasjon: ISessionKonfigurasjon) => {
    const pingHvertFjerdeMinutt = 1000 * 60 * 4; // Connection blir ugyldig etter fem minutter, pinger derfor hvert fjerde minutt
    const redisClient = redis.createClient({
        database: 1,
        url: sessionKonfigurasjon.valkeyFullUrl,
        username: sessionKonfigurasjon.valkeyBrukernavn,
        password: sessionKonfigurasjon.valkeyPassord,
        socket: {
            reconnectStrategy: attempts => {
                if (attempts >= 100 && hentErforbindelsenTilValkeyTilgjengelig()) {
                    settErforbindelsenTilValkeyTilgjengelig(false);
                }

                // Reconnect after
                return Math.min(attempts * 100, 1000);
            },
        },
        pingInterval: pingHvertFjerdeMinutt,
    });
    return redisClient;
};

type CsrfTokenData = {
    token: string;
    opprettet: number;
};

const csrfTokens = new Map<string, CsrfTokenData>();
const MAKS_TOKEN_ALDER = 24 * 60 * 60 * 1000; // 1 dag

const genererCsrfToken = (sessionId: string) => {
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

const fjernUtgåtteTokens = () => {
    for (const [sessionId, tokenData] of csrfTokens.entries()) {
        const tokenAlder = Date.now() - tokenData.opprettet;
        if (tokenAlder > MAKS_TOKEN_ALDER) {
            csrfTokens.delete(sessionId);
        }
    }
};

// Fjern utgåtte tokens hver time
setInterval(fjernUtgåtteTokens, 60 * 60 * 1000);

export default (app: Express, sessionKonfigurasjon: ISessionKonfigurasjon) => {
    app.use(cookieParser(sessionKonfigurasjon.cookieSecret));
    app.set('trust proxy', 1);

    if (sessionKonfigurasjon.valkeyFullUrl) {
        const redisClient = redisClientForAiven(sessionKonfigurasjon);

        /**
         * Logge hendelser i redisclient for å debugge merkelige sockettimeouts
         */
        redisClient.on('error', err => {
            logError(`Redis Error: ${err}`);
            settErforbindelsenTilValkeyTilgjengelig(false);
        });
        redisClient.on('connect', () => logInfo('Redis connected'));
        redisClient.on('reconnecting', () => logInfo('Redis reconnecting'));
        redisClient.on('ready', () => {
            logInfo('Redis ready!');
            settErforbindelsenTilValkeyTilgjengelig(true);
        });

        redisClient.connect().catch(logError);
        redisClient.unref();

        const store = new RedisStore({
            disableTouch: true,
            client: redisClient,
            ttl: sessionKonfigurasjon.sessionMaxAgeSekunder,
        });

        app.use(
            session({
                cookie: {
                    maxAge: sessionKonfigurasjon.sessionMaxAgeSekunder
                        ? sessionKonfigurasjon.sessionMaxAgeSekunder * 1000
                        : undefined,
                    sameSite: 'strict',
                    secure: sessionKonfigurasjon.secureCookie,
                },
                unset: 'destroy',
                name: sessionKonfigurasjon.navn,
                resave: false,
                saveUninitialized: false,
                secret: appConfig.sessionSecret,
                store,
            })
        );
    } else {
        logInfo('Setter opp in-memory db for session');

        app.use(
            session({
                cookie: { sameSite: 'strict', secure: sessionKonfigurasjon.secureCookie },
                name: sessionKonfigurasjon.navn,
                resave: false,
                saveUninitialized: false,
                secret: appConfig.sessionSecret,
            })
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.get('/api/csrf-token', (req: Request, res: Response): any => {
        const sessionId = req.session.id;
        if (!sessionId) {
            return res.status(401).json({ error: 'Ingen aktiv sesjon' });
        }

        const csrfToken = genererCsrfToken(sessionId);
        return res.json({ csrfToken });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.use((req: Request, res: Response, next: NextFunction): any => {
        const ikkeSikreMetoder = ['GET', 'HEAD', 'OPTIONS'];
        if (ikkeSikreMetoder.includes(req.method)) {
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
    });
};
