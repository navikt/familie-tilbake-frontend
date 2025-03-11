import type { TexasClient } from './auth/texas';
import type { NextFunction, Request, Response } from 'express';
import type { Counter } from 'prom-client';

import express from 'express';

import {
    authenticateAzure,
    authenticateAzureCallback,
    ensureAuthenticated,
    logout,
} from './auth/authenticate';
import { hentBrukerprofil, setBrukerprofilPåSesjonRute } from './auth/bruker';

const router = express.Router();

export default (
    texasClient: TexasClient,
    prometheusTellere?: { [key: string]: Counter<string> }
) => {
    // Authentication
    router.get('/login', (req: Request, res: Response, next: NextFunction) => {
        if (prometheusTellere && prometheusTellere.login_route) {
            prometheusTellere.login_route.inc();
        }

        authenticateAzure(req, res, next);
    });
    router.use('/auth/openid/callback', authenticateAzureCallback());
    router.get('/auth/logout', (req: Request, res: Response) => logout(req, res));

    // Bruker
    router.get(
        '/user/profile',
        ensureAuthenticated(texasClient, true),
        setBrukerprofilPåSesjonRute(texasClient),
        hentBrukerprofil()
    );

    return router;
};
