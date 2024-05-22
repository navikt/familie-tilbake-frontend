import path from 'path';

import { Response, Request, Router, NextFunction } from 'express';

import { Client, ensureAuthenticated, envVar, logRequest } from '@navikt/familie-backend';
import { LOG_LEVEL } from '@navikt/familie-logging';

import { buildPath } from './config';
import { prometheusTellere } from './metrikker';

export const redirectHvisInternUrlIPreprod = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (
            process.env.ENV === 'preprod' &&
            req.headers.host === 'familie-tilbake-frontend.intern.dev.nav.no'
        ) {
            res.redirect(`https://familie-tilbake-frontend.ansatt.dev.nav.no${req.url}`);
        } else {
            next();
        }
    };
};

export default (authClient: Client, router: Router) => {
    router.get('/version', (_: Request, res: Response) => {
        res.status(200)
            .send({ status: 'SUKSESS', data: envVar('APP_VERSION') })
            .end();
    });

    router.get('/error', (_: Request, res: Response) => {
        prometheusTellere.errorRoute.inc();
        res.sendFile('error.html', { root: path.join(`assets/`) });
    });

    // Feilhåndtering
    router.post('/logg-feil', (req: Request, res: Response) => {
        logRequest(req, req.body.melding, LOG_LEVEL.ERROR);
        res.status(200).send();
    });

    // APP
    router.get(
        '*',
        redirectHvisInternUrlIPreprod(),
        ensureAuthenticated(authClient, false),
        (_: Request, res: Response) => {
            prometheusTellere.appLoad.inc();

            res.sendFile('index.html', { root: path.join(process.cwd(), buildPath) });
        }
    );

    return router;
};
