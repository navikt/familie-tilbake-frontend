import type { TexasClient } from './backend/auth/texas';
import type { Response, Request, Router } from 'express';

import fs from 'fs';
import path from 'path';

import { ensureAuthenticated } from './backend/auth/authenticate';
import { genererCsrfToken } from './backend/auth/middleware';
import { logRequest } from './backend/utils';
import { appConfig, buildPath } from './config';
import { logError, LogLevel } from './logging/logging';
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
    router.get(
        '/*splat',
        ensureAuthenticated(texasClient, false),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req: Request, res: Response): any => {
            prometheusTellere.appLoad.inc();
            const csrfToken = genererCsrfToken(req.session);
            let htmlInnhold = '';
            try {
                htmlInnhold = fs.readFileSync(
                    `${path.join(process.cwd(), buildPath)}/index.html`,
                    'utf8'
                );
            } catch (error) {
                logError(`Feil ved lesing av index.html: ${error}`);
                return res.status(500).json({ error: 'Intern serverfeil' });
            }
            htmlInnhold = htmlInnhold.replace(
                'content="{{ csrf_token() }}"',
                `content="${csrfToken}"`
            );

            return res.send(htmlInnhold);
        }
    );

    return router;
};
