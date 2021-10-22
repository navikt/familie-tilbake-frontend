import path from 'path';

import { Response, Request, Router } from 'express';

import {
    Client,
    ensureAuthenticated,
    envVar,
    getOnBehalfOfAccessToken,
    logRequest,
} from '@navikt/familie-backend';
import { LOG_LEVEL } from '@navikt/familie-logging';

import { buildPath, oboTilbakeConfig, forvalterRolle } from './config';
import { prometheusTellere } from './metrikker';

interface Bruker {
    displayName: string;
    groups: string[];
}

const hentToken = (authClient: Client) => {
    return async (req: Request, res: Response) => {
        const bruker: Bruker = req.session.user;
        if (bruker.groups.includes(forvalterRolle)) {
            getOnBehalfOfAccessToken(authClient, req, oboTilbakeConfig).then(
                (accessToken: string) => {
                    res.status(200).send(accessToken);
                }
            );
        } else {
            res.status(404).send('Not found');
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

    router.get('/forvaltning-token', ensureAuthenticated(authClient, true), hentToken(authClient));

    // APP
    router.get('*', ensureAuthenticated(authClient, false), (_: Request, res: Response) => {
        prometheusTellere.appLoad.inc();

        res.sendFile('index.html', { root: path.join(process.cwd(), buildPath) });
    });

    return router;
};
