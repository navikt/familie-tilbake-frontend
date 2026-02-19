import type { NextFunction, Request, Response } from 'express';

import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

import backend from './backend';
import { ensureAuthenticated } from './backend/auth/authenticate';
import konfigurerSession from './backend/auth/session';
import { appConfig, proxyUrl, sessionConfig, texasConfig } from './config';
import { logInfo } from './logging/logging';
import { prometheusTellere } from './metrikker';
import { attachToken, doProxy, doRedirectProxy } from './proxy';
import setupRouter from './router';

(async (): Promise<void> => {
    const port = 8000;

    const { app, texasClient, router } = backend(texasConfig, prometheusTellere);

    app.use((req: Request, _res: Response, next: NextFunction) => {
        req.headers['nav-call-id'] = crypto.randomUUID();
        req.headers['nav-consumer-id'] = 'familie-tilbake-frontend';
        next();
    });
    app.use(cookieParser(sessionConfig.cookieSecret));
    app.use(konfigurerSession(app, sessionConfig));
    app.use(
        '/familie-tilbake/api',
        ensureAuthenticated(texasClient, true),
        attachToken(texasClient, appConfig.backendApiScope),
        doProxy(proxyUrl)
    );
    app.use('/api/v1/brev', doProxy('http://localhost:3000/api/v1/brev'));

    app.use('/redirect', doRedirectProxy());

    // Sett opp express og router etter proxy. Spesielt viktig med tanke på større payloads
    app.use(json({ limit: '200mb' }));
    app.use(urlencoded({ limit: '200mb', extended: true }));
    app.use('/', await setupRouter(texasClient, router));

    app.listen(port, '0.0.0.0', () => {
        logInfo(`Server startet på port ${port}. Build version: ${appConfig.version}.`);
    });
})();
