import './konfigurerApp';

import path from 'path';

import express from 'express';
import expressStaticGzip from 'express-static-gzip';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import backend, {
    IApp,
    ensureAuthenticated,
    getLogTimestamp,
    info,
    envVar,
} from '@navikt/familie-backend';

import { sessionConfig } from './config';
import { attachToken, doProxy } from './proxy';
import setupRouter from './router';

// eslint-disable-next-line
const config = require('../../build_n_deploy/webpack/webpack.dev');

const port = 8000;

backend(sessionConfig).then(({ app, azureAuthClient, router }: IApp) => {
    let middleware;

    if (process.env.NODE_ENV === 'development') {
        const compiler = webpack(config);
        // @ts-ignore
        middleware = webpackDevMiddleware(compiler, {
            publicPath: config.output.publicPath,
            writeToDisk: true,
        });

        app.use(middleware);
        // @ts-ignore
        app.use(webpackHotMiddleware(compiler));
    } else {
        app.use('/assets', expressStaticGzip(path.join(process.cwd(), 'frontend_production'), {}));
    }

    app.use(
        '/familie-tilbake/api',
        ensureAuthenticated(azureAuthClient, true),
        attachToken(azureAuthClient),
        doProxy()
    );

    // Sett opp express og router etter proxy. Spesielt viktig med tanke på større payloads
    app.use(express.json({ limit: '200mb' }));
    app.use(express.urlencoded({ limit: '200mb', extended: true }));
    app.use('/', setupRouter(azureAuthClient, router));

    app.listen(port, '0.0.0.0', () => {
        info(
            `${getLogTimestamp()}: server startet på port ${port}. Build version: ${envVar(
                'APP_VERSION'
            )}.`
        );
    });
});
