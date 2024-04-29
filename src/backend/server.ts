import './konfigurerApp';

import path from 'path';

import { json, urlencoded, NextFunction, Request, Response } from 'express';
import expressStaticGzip from 'express-static-gzip';
import { v4 as uuidv4 } from 'uuid';
// eslint-disable-next-line
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import backend, { IApp, ensureAuthenticated, envVar } from '@navikt/familie-backend';
import { logInfo, stdoutLogger } from '@navikt/familie-logging';

import { oboHistorikkConfig, oboTilbakeConfig, sessionConfig } from './config';
import { prometheusTellere } from './metrikker';
import {
    attachToken,
    doHistorikkApiProxy,
    doHistorikkStreamProxy,
    doProxy,
    doRedirectProxy,
} from './proxy';
import setupRouter from './router';
import config from '../webpack/webpack.dev';

const port = 8000;

backend(sessionConfig, prometheusTellere).then(({ app, azureAuthClient, router }: IApp) => {
    let middleware;

    if (process.env.NODE_ENV === 'development') {
        const compiler = webpack(config);
        middleware = webpackDevMiddleware(compiler, {
            publicPath: config.output?.publicPath,
            writeToDisk: true,
        });

        app.use(middleware);
        // @ts-ignore
        app.use(webpackHotMiddleware(compiler));
    } else {
        app.use('/assets', expressStaticGzip(path.join(process.cwd(), 'frontend_production'), {}));
    }

    app.use((req: Request, _res: Response, next: NextFunction) => {
        req.headers['nav-call-id'] = uuidv4();
        req.headers['nav-consumer-id'] = 'familie-tilbake-frontend';
        next();
    });

    app.use(
        '/familie-historikk/stream',
        ensureAuthenticated(azureAuthClient, true),
        attachToken(azureAuthClient, oboHistorikkConfig),
        doHistorikkStreamProxy()
    );
    app.use(
        '/familie-historikk/api',
        ensureAuthenticated(azureAuthClient, true),
        attachToken(azureAuthClient, oboHistorikkConfig),
        doHistorikkApiProxy()
    );

    const logRequest = (_: Request, _res: Response, next: NextFunction) => {
        console.log('Logger request!!!');
        stdoutLogger.info('Logger request');
        return next();
    };

    app.use(
        '/familie-tilbake/api',
        logRequest,
        ensureAuthenticated(azureAuthClient, true),
        logRequest,
        attachToken(azureAuthClient, oboTilbakeConfig),
        logRequest,
        doProxy()
    );

    app.use(
        '/familie-tullball/api',
        logRequest,
        ensureAuthenticated(azureAuthClient, true),
        logRequest,
        attachToken(azureAuthClient, oboTilbakeConfig),
        logRequest,
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
