import type { TexasClient } from './texas';
import type { NextFunction, Request, Response } from 'express';

import { logRequest } from '../utils';
import { tokenSetSelfId, utledAccessToken } from './tokenUtils';
import { LogLevel } from '../../logging/logging';

export const ensureAuthenticated = (texasClient: TexasClient, sendUnauthorized: boolean) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const token = utledAccessToken(req);
        const validAccessToken = token && (await texasClient.validateLogin(token));
        logRequest(
            req,
            `ensureAuthenticated. hasValidAccessToken=${validAccessToken}`,
            LogLevel.Debug
        );

        if (validAccessToken) {
            req.session.passport = {
                user: {
                    tokenSets: {
                        [tokenSetSelfId]: {
                            access_token: token,
                        },
                    },
                },
            };
        } else {
            const pathname = req.originalUrl;
            if (sendUnauthorized) {
                res.status(401).send('Unauthorized');
            } else {
                res.redirect(`/oauth2/login?redirect=${pathname}`);
            }
        }

        return next();
    };
};
