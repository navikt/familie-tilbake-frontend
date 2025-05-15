import type { TexasClient } from './backend/auth/texas';
import type { Response, Request, Router } from 'express';
import type { ViteDevServer } from 'vite';

import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { ensureAuthenticated } from './backend/auth/authenticate';
import { genererCsrfToken } from './backend/auth/middleware';
import { logRequest } from './backend/utils';
import { appConfig, buildPath } from './config';
import { logError, LogLevel } from './logging/logging';
import { prometheusTellere } from './metrikker';

let vite: ViteDevServer;
const isProd = process.env.NODE_ENV === 'production';

let cachedHtmlProd: string | null = null;

async function getHtmlInnhold(url: string, csrfToken: string, isProd: boolean): Promise<string> {
    if (isProd && cachedHtmlProd) return cachedHtmlProd;

    const filePath = path.join(process.cwd(), isProd ? buildPath : 'src/frontend', 'index.html');

    let html = fs.readFileSync(filePath, 'utf-8');

    if (!isProd) {
        html = await vite.transformIndexHtml(url, html);
    }

    html = html.replace('content="__CSRF__"', `content="${csrfToken}"`);

    if (isProd) cachedHtmlProd = html;

    return html;
}

export default async (texasClient: TexasClient, router: Router) => {
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
    if (!isProd) {
        vite = await createViteServer({
            root: path.join(process.cwd(), 'src/frontend'),
            server: { middlewareMode: true },
            appType: 'custom',
        });
        router.use(vite.middlewares);
    }

    router.get(
        ['/', '/fagsystem/*splat'],
        ensureAuthenticated(texasClient, false),
        async (req: Request, res: Response): Promise<void> => {
            prometheusTellere.appLoad.inc();
            const csrfToken = genererCsrfToken(req.session);
            const url = req.originalUrl;
            try {
                const htmlInnhold = await getHtmlInnhold(url, csrfToken, isProd);
                res.status(200).set({ 'Content-Type': 'text/html' }).end(htmlInnhold);
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
