import type { TexasClient } from './texas';
import type { NextFunction, Request, Response } from 'express';

import { LogLevel } from '../../logging/logging';
import { logRequest } from '../utils';

export const ensureAuthenticated = (texasClient: TexasClient, sendUnauthorized: boolean) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = utledAccessToken(req);
        const introspection = token ? await texasClient.validateLogin(token) : null;
        logRequest(
            req,
            `ensureAuthenticated. hasValidAccessToken=${!!introspection}`,
            LogLevel.Debug
        );

        if (!introspection) {
            const pathname = req.originalUrl;
            if (sendUnauthorized) {
                res.status(401).send('Unauthorized');
            } else {
                res.redirect(`/oauth2/login?redirect=${pathname}`);
            }
            return;
        }

        const tokenSubject = introspection.sub;
        if (tokenSubject && req.session.user && req.session.user.tokenSubject !== tokenSubject) {
            logRequest(
                req,
                'Token tilhører en annen bruker enn sesjonen. Invaliderer sesjon.',
                LogLevel.Warning
            );
            try {
                await gjenoppretterSesjon(req);
            } catch (err) {
                logRequest(req, `Feil ved gjenoppretting av sesjon: ${err}`, LogLevel.Error);
                res.status(500).send('Intern feil ved sesjonsbehandling');
                return;
            }
        }

        res.locals.tokenSubject = tokenSubject;
        return next();
    };
};

const gjenoppretterSesjon = (req: Request): Promise<void> => {
    return new Promise((resolve, reject) => {
        req.session.regenerate(err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

export const utledAccessToken = (req: Request): string | false => {
    if (!req.headers.authorization?.startsWith('Bearer ')) {
        return false;
    }
    return req.headers.authorization.substring(7);
};
