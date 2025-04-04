import type { TexasClient } from './backend/auth/texas';
import type { Response, Request, Router } from 'express';

import path from 'path';

import { ensureAuthenticated } from './backend/auth/authenticate';
import { logRequest } from './backend/utils';
import { appConfig, buildPath } from './config';
import { LogLevel } from './logging/logging';
import { prometheusTellere } from './metrikker';

export default (texasClient: TexasClient, router: Router) => {
    router.get('/version', (_: Request, res: Response) => {
        res.status(200).send({ status: 'SUKSESS', data: appConfig.version }).end();
    });

    router.get('/error', (_: Request, res: Response) => {
        prometheusTellere.errorRoute.inc();
        res.sendFile('error.html', { root: path.join(`assets/`) });
    });

    // Feilhåndtering
    router.post('/logg-feil', (req: Request, res: Response) => {
        logRequest(req, req.body.melding, LogLevel.Error);
        res.status(200).send();
    });

    // APP
    router.get('/*splat', ensureAuthenticated(texasClient, false), (_: Request, res: Response) => {
        prometheusTellere.appLoad.inc();

        res.sendFile('index.html', { root: path.join(process.cwd(), buildPath) });
    });

    return router;
};
