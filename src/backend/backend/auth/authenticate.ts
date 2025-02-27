import type { NextFunction, Request, Response } from 'express';
import type { Client, TokenSet } from 'openid-client';

import passport from 'passport';

import { logRequest } from '../utils';
import { getTokenSetsFromSession, hasValidAccessToken, tokenSetSelfId } from './tokenUtils';
import { LOG_LEVEL } from '../../logging/logging';
import { appConfig } from '../config';
export const authenticateAzure = (req: Request, res: Response, next: NextFunction) => {
    const regex: RegExpExecArray | null = /redirectUrl=(.*)/.exec(req.url);
    const redirectUrl = regex ? regex[1] : 'invalid';

    const successRedirect = regex ? redirectUrl : '/';

    logRequest(
        req,
        `authenticateAzure. redirectUrl=${redirectUrl}, successRedirect=${successRedirect}`,
        LOG_LEVEL.DEBUG
    );
    if (!req.session) {
        throw new Error('Mangler sesjon på kall');
    }

    req.session.redirectUrl = successRedirect;
    try {
        passport.authenticate('azureOidc', {
            failureRedirect: '/error',
            successRedirect,
        })(req, res, next);
    } catch (err) {
        throw new Error(`Error during authentication: ${err}`);
    }
};

export const authenticateAzureCallback = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.session) {
                throw new Error('Mangler sesjon på kall');
            }

            passport.authenticate('azureOidc', {
                failureRedirect: '/error',
                successRedirect: req.session.redirectUrl || '/',
            })(req, res, next);
        } catch (err) {
            throw new Error(`Error during authentication: ${err}`);
        }
    };
};

export const ensureAuthenticated = (authClient: Client, sendUnauthorized: boolean) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const validAccessToken = hasValidAccessToken(req);
        logRequest(
            req,
            `ensureAuthenticated. isAuthenticated=${req.isAuthenticated()}, hasValidAccessToken=${validAccessToken}`,
            LOG_LEVEL.DEBUG
        );

        if (req.isAuthenticated()) {
            if (!validAccessToken) {
                const tokenSet: TokenSet = getTokenSetsFromSession(req)[tokenSetSelfId];
                await authClient
                    .refresh(tokenSet.refresh_token ?? '')
                    .then((tokenSet: TokenSet) => {
                        if (!req.session) {
                            throw new Error('Mangler sesjon på kall');
                        }

                        req.session.passport.user.tokenSets[tokenSetSelfId] = tokenSet;
                    })
                    .catch((error: Error) => {
                        logRequest(
                            req,
                            `Feilet ved refresh av tokenset: ${error.message}`,
                            LOG_LEVEL.WARNING
                        );
                        const pathname = req.originalUrl;
                        if (sendUnauthorized) {
                            res.status(401).send('Unauthorized');
                        } else {
                            res.redirect(`/login?redirectUrl=${pathname}`);
                        }
                        return;
                    });
            }
            return next();
        } else {
            const pathname = req.originalUrl;
            if (sendUnauthorized) {
                res.status(401).send('Unauthorized');
            } else {
                res.redirect(`/login?redirectUrl=${pathname}`);
            }
        }
    };
};

export const logout = (req: Request, res: Response) => {
    if (!req.session) {
        throw new Error('Mangler sesjon på kall');
    }

    logRequest(req, `logout.`, LOG_LEVEL.DEBUG);

    res.redirect(appConfig.logoutRedirectUri);
    req.session.destroy((error: Error) => {
        if (error) {
            logRequest(req, `error during logout: ${error}`, LOG_LEVEL.ERROR);
        }
    });
};
