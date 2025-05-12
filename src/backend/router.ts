import type { TexasClient } from './backend/auth/texas';
import type { Response, Request, Router } from 'express';

import fs from 'fs';
import path from 'path';

import { ensureAuthenticated } from './backend/auth/authenticate';
import { genererCsrfToken } from './backend/auth/middleware';
import { logRequest } from './backend/utils';
import { aInntektBaseUrl, appConfig, buildPath, gosysBaseUrl, modiaBaseUrl } from './config';
import { logError, LogLevel } from './logging/logging';
import { prometheusTellere } from './metrikker';

export default (texasClient: TexasClient, router: Router) => {
    router.get('/version', (_: Request, res: Response) => {
        res.status(200).send({ status: 'SUKSESS', data: appConfig.version }).end();
    });

    router.get('/system-url', (_: Request, res: Response) => {
        res.status(200).send({ aInntektBaseUrl, gosysBaseUrl, modiaBaseUrl }).end();
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
    router.get(
        ['/', '/fagsystem/*splat'],
        ensureAuthenticated(texasClient, false),
        (req: Request, res: Response): void => {
            prometheusTellere.appLoad.inc();
            const csrfToken = genererCsrfToken(req.session);
            try {
                let htmlInnhold = fs.readFileSync(
                    `${path.join(process.cwd(), buildPath)}/index.html`,
                    'utf8'
                );
                htmlInnhold = htmlInnhold.replace(
                    'content="{{ csrf_token() }}"',
                    `content="${csrfToken}"`
                );
                res.send(htmlInnhold);
            } catch (error) {
                logError(`Feil ved lesing av index.html: ${error}`);
                res.status(500).json({ error: 'Feil ved lesing av index.html' });
            }
        }
    );

    router.use((_: Request, res: Response) => {
        res.status(404).sendFile(`${path.join(process.cwd(), buildPath)}/index.html`);
    });

    return router;
};
