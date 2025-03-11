import type { TexasClient } from './texas';
import type { NextFunction, Request, Response } from 'express';

import passport from 'passport';

import { logRequest } from '../utils';
import { tokenSetSelfId } from './tokenUtils';
import { LogLevel } from '../../logging/logging';
import { appConfig } from '../config';

export const authenticateAzure = (req: Request, res: Response, next: NextFunction) => {
    const regex: RegExpExecArray | null = /redirectUrl=(.*)/.exec(req.url);
    const redirectUrl = regex ? regex[1] : 'invalid';

    const successRedirect = regex ? redirectUrl : '/';

    logRequest(
        req,
        `authenticateAzure. redirectUrl=${redirectUrl}, successRedirect=${successRedirect}`,
        LogLevel.Debug
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

export const ensureAuthenticated = (texasClient: TexasClient, sendUnauthorized: boolean) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization?.substring(8);
        const validAccessToken = token && (await texasClient.validateLogin(token));
        logRequest(
            req,
            `ensureAuthenticated. isAuthenticated=${req.isAuthenticated()}, hasValidAccessToken=${validAccessToken}`,
            LogLevel.Debug
        );

        if (req.isAuthenticated()) {
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
                    res.redirect(`/login?redirectUrl=${pathname}`);
                }
            }
        }

        return next();
    };
};

export const logout = (req: Request, res: Response) => {
    if (!req.session) {
        throw new Error('Mangler sesjon på kall');
    }

    logRequest(req, `logout.`, LogLevel.Debug);

    res.redirect(appConfig.logoutRedirectUri);
    req.session.destroy((error: Error) => {
        if (error) {
            logRequest(req, `error during logout: ${error}`, LogLevel.Error);
        }
    });
};
