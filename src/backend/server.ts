import './konfigurerApp';
import type { IApp } from './backend';
import type { NextFunction, Request, Response } from 'express';

import { json, urlencoded } from 'express';
import expressStaticGzip from 'express-static-gzip';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import { appConfig } from './backend';
import backend from './backend';
import { ensureAuthenticated } from './backend/auth/authenticate';
import { sessionConfig, texasConfig } from './config';
import { logInfo } from './logging/logging';
import { prometheusTellere } from './metrikker';
import { attachToken, doProxy, doRedirectProxy } from './proxy';
import setupRouter from './router';
import { envVar } from './utils';
import config from '../webpack/webpack.dev';

const port = 8000;

backend(sessionConfig, texasConfig, prometheusTellere).then(
    ({ app, azureAuthClient, texasAuthClient, router }: IApp) => {
        let middleware;

        if (process.env.NODE_ENV === 'development') {
            const compiler = webpack(config);
            middleware = webpackDevMiddleware(compiler, {
                publicPath: config.output?.publicPath,
                writeToDisk: true,
            });

            app.use(middleware);
            app.use(webpackHotMiddleware(compiler));
        } else {
            app.use(
                '/assets',
                expressStaticGzip(path.join(process.cwd(), 'frontend_production'), {})
            );
        }

        app.use((req: Request, _res: Response, next: NextFunction) => {
            req.headers['nav-call-id'] = uuidv4();
            req.headers['nav-consumer-id'] = 'familie-tilbake-frontend';
            next();
        });

        app.use(
            '/familie-tilbake/api',
            ensureAuthenticated(azureAuthClient, true),
            attachToken(texasAuthClient, {
                clientId: appConfig.clientId,
                scopes: [appConfig.backendApiScope],
            }),
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
    }
);
