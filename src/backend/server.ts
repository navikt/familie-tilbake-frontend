import './konfigurerApp';
import type { IApp } from './backend';
import type { NextFunction, Request, Response } from 'express';

import { json, urlencoded } from 'express';
import expressStaticGzip from 'express-static-gzip';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import backend from './backend';
import { ensureAuthenticated } from './backend/auth/authenticate';
import { oboTilbakeConfig, sessionConfig } from './config';
import { logInfo } from './logging/logging';
import { envVar } from './logging/utils';
import { prometheusTellere } from './metrikker';
import { attachToken, doProxy, doRedirectProxy } from './proxy';
import setupRouter from './router';

const port = 8000;

backend(sessionConfig, prometheusTellere).then(({ app, azureAuthClient, router }: IApp) => {
    if (process.env.NODE_ENV === 'development') {
        // In development, the Vite dev server will handle serving the frontend
        // The frontend will be available at http://localhost:5173
        logInfo('Running in development mode. Frontend will be served by Vite dev server.');
    } else {
        app.use('/assets', expressStaticGzip(path.join(process.cwd(), 'frontend_production'), {}));
    }

    app.use((req: Request, _res: Response, next: NextFunction) => {
        req.headers['nav-call-id'] = uuidv4();
        req.headers['nav-consumer-id'] = 'familie-tilbake-frontend';
        next();
    });

    app.use(
        '/familie-tilbake/api',
        ensureAuthenticated(azureAuthClient, true),
        attachToken(azureAuthClient, oboTilbakeConfig),
        doProxy()
    );

    app.use('/redirect', doRedirectProxy());

    // Sett opp express og router etter proxy. Spesielt viktig med tanke på større payloads
    app.use(json({ limit: '200mb' }));
    app.use(urlencoded({ limit: '200mb', extended: true }));
    app.use('/', setupRouter(azureAuthClient, router));

    app.listen(port, '0.0.0.0', () => {
        logInfo(`Server startet på port ${port}. Build version: ${envVar('APP_VERSION')}.`);
    });
});
