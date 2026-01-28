import type { TexasClient } from './backend/auth/texas';
import type { Response, Request, Router } from 'express';
import type { ViteDevServer } from 'vite';

import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { ensureAuthenticated } from './backend/auth/authenticate';
import { genererCsrfToken } from './backend/auth/middleware';
import { logRequest } from './backend/utils';
import { aInntektUrl, appConfig, buildPath, gosysBaseUrl, modiaBaseUrl } from './config';
import { logError, logInfo, LogLevel } from './logging/logging';
import { prometheusTellere } from './metrikker';

let vite: ViteDevServer;
const isProd = process.env.NODE_ENV === 'production';

const getHtmlInnholdProd = (): string => {
    return fs.readFileSync(path.join(process.cwd(), buildPath, 'index.html'), 'utf-8');
};

const getHtmlInnholdDev = async (url: string): Promise<string> => {
    let htmlInnhold = fs.readFileSync(
        path.join(process.cwd(), 'src/frontend', 'index.html'),
        'utf-8'
    );

    htmlInnhold = await vite.transformIndexHtml(url, htmlInnhold);
    return htmlInnhold;
};

export default async (texasClient: TexasClient, router: Router): Promise<Router> => {
    router.get('/version', (_: Request, res: Response) => {
        res.status(200).send({ status: 'SUKSESS', data: appConfig.version }).end();
    });

    router.get('/brukerlenker', (_: Request, res: Response) => {
        res.status(200).send({ aInntektUrl, gosysBaseUrl, modiaBaseUrl }).end();
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
    if (!isProd) {
        vite = await createViteServer({
            root: path.join(process.cwd(), 'src/frontend'),
            server: { middlewareMode: true },
            appType: 'custom',
        });
        router.use(vite.middlewares);
    }

    router.get(
        ['/', '/fagsystem/*splat', '/pdf'],
        ensureAuthenticated(texasClient, false),
        async (req: Request, res: Response): Promise<void> => {
            prometheusTellere.appLoad.inc();
            const gammelCsrfToken = req.session.csrfToken;
            const csrfToken = genererCsrfToken(req.session);
            logInfo(
                `Gammel CSRF-tokenstart=${gammelCsrfToken?.substring(0, 4)}, CSRF-tokenstart=${csrfToken.substring(0, 4)}, path=${req.path}`
            );
            const url = req.originalUrl;
            try {
                let htmlInnhold = isProd ? getHtmlInnholdProd() : await getHtmlInnholdDev(url);
                htmlInnhold = htmlInnhold.replace('content="__CSRF__"', `content="${csrfToken}"`);

                res.status(200).set({ 'Content-Type': 'text/html' }).end(htmlInnhold);
            } catch (error) {
                logError(`Feil ved lesing av index.html: ${error}`);
                res.status(500).json({
                    frontendFeilmelding: 'Feil ved lesing av index.html.',
                    status: 'FEILET',
                });
            }
        }
    );

    router.use((_: Request, res: Response) => {
        res.status(404).sendFile(`${path.join(process.cwd(), buildPath)}/index.html`);
    });

    return router;
};
