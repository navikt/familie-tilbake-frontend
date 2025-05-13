import type { TexasClient } from './backend/auth/texas';
import type { Response, Request, Router } from 'express';
import type { ViteDevServer } from 'vite';

import fs from 'fs';
import path from 'path';

import { ensureAuthenticated } from './backend/auth/authenticate';
import { genererCsrfToken } from './backend/auth/middleware';
import { logRequest } from './backend/utils';
import { appConfig } from './config';
import { logError, LogLevel } from './logging/logging';
import { prometheusTellere } from './metrikker';

export default (texasClient: TexasClient, router: Router, vite: ViteDevServer) => {
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
        '*splat',
        ensureAuthenticated(texasClient, false),
        async (req: Request, res: Response): Promise<void> => {
            prometheusTellere.appLoad.inc();
            const csrfToken = genererCsrfToken(req.session);
            const url = req.originalUrl;
            try {
                // let htmlInnhold = fs.readFileSync(
                //     `${path.join(process.cwd(), buildPath)}/index.html`,
                //     'utf8'
                // );
                // htmlInnhold = htmlInnhold.replace(
                //     'content="{{ csrf_token() }}"',
                //     `content="${csrfToken}"`
                // );
                // 1. Read index.html from disk (source, not dist)

                let template = fs.readFileSync(
                    path.join(process.cwd(), 'src/frontend', 'index.html'),
                    'utf-8'
                );

                template = await vite.transformIndexHtml(url, template);

                template = template.replace('content="__CSRF__"', `content="${csrfToken}"`);

                res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
            } catch (error) {
                console.log(error);
                logError(`Feil ved lesing av index.html: ${error}`);
                res.status(500).json({ error: 'Feil ved lesing av index.html' });
            }
        }
    );

    return router;
};
