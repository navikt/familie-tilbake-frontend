import type { TexasClient } from './texas';
import type { NextFunction, Request, Response } from 'express';

import { LogLevel } from '../../logging/logging';
import { logRequest } from '../utils';

export const ensureAuthenticated = (texasClient: TexasClient, sendUnauthorized: boolean) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = utledAccessToken(req);
        const validAccessToken = token && (await texasClient.validateLogin(token));
        logRequest(
            req,
            `ensureAuthenticated. hasValidAccessToken=${validAccessToken}`,
            LogLevel.Debug
        );

        if (!validAccessToken) {
            const pathname = req.originalUrl;
            if (sendUnauthorized) {
                res.status(401).send('Unauthorized');
            } else {
                res.redirect(`/oauth2/login?redirect=${pathname}`);
            }
            return;
        }

        return next();
    };
};

export const utledAccessToken = (req: Request): string | false => {
    if (!req.headers.authorization?.startsWith('Bearer ')) {
        return false;
    }
    return req.headers.authorization.substring(7);
};
