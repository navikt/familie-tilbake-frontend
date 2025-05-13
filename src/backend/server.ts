import type { NextFunction, Request, Response } from 'express';

import compression from 'compression';
import cookieParser from 'cookie-parser';
import express, { json, urlencoded } from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createServer as createViteServer } from 'vite';

import backend from './backend';
import { ensureAuthenticated } from './backend/auth/authenticate';
import { csrfBeskyttelse } from './backend/auth/middleware';
import konfigurerSession from './backend/auth/session';
import { appConfig, sessionConfig, texasConfig } from './config';
import { logInfo } from './logging/logging';
import { prometheusTellere } from './metrikker';
import { attachToken, doProxy, doRedirectProxy } from './proxy';
import setupRouter from './router';

(async () => {
    const port = 8000;

    const { app, texasClient, router } = backend(texasConfig, prometheusTellere);

    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
    });

    // app.use(vite.middlewares);

    if (process.env.NODE_ENV !== 'development') {
        const assetsPath = path.join(process.cwd(), 'frontend_production/assets');

        app.use(compression());
        app.use(express.static(assetsPath));

        app.get('*', (_req, res) => {
            res.sendFile(path.join(assetsPath, 'index.html'));
        });
    }

    app.use((req: Request, _res: Response, next: NextFunction) => {
        req.headers['nav-call-id'] = uuidv4();
        req.headers['nav-consumer-id'] = 'familie-tilbake-frontend';
        next();
    });
    app.use(cookieParser(sessionConfig.cookieSecret));
    app.use(konfigurerSession(app, sessionConfig));
    app.use(csrfBeskyttelse);
    app.use(
        '/familie-tilbake/api',
        ensureAuthenticated(texasClient, true),
        attachToken(texasClient, appConfig.backendApiScope),
        doProxy()
    );

    app.use('/redirect', doRedirectProxy());

    // Sett opp express og router etter proxy. Spesielt viktig med tanke på større payloads
    app.use(json({ limit: '200mb' }));
    app.use(urlencoded({ limit: '200mb', extended: true }));
    app.use('/', setupRouter(texasClient, router, vite));

    app.listen(port, '0.0.0.0', () => {
        logInfo(`Server startet på port ${port}. Build version: ${appConfig.version}.`);
    });
})();
