import express, { json, urlencoded, Router } from 'express';
import { webpack } from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import { setupRouter } from './mock-routes';

// eslint-disable-next-line
const config = require('../../build_n_deploy/webpack/webpack.dev');

const port = 8008;

const compiler = webpack(config);
// @ts-ignore
const middleware = webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
    writeToDisk: true,
});

const app = express();
app.use(middleware);
app.use(webpackHotMiddleware(compiler));

app.use(json({ limit: '200mb' }));
app.use(urlencoded({ limit: '200mb', extended: true }));
app.use('/', setupRouter(Router()));

app.listen(port, '0.0.0.0', () => {
    console.info('=== mock-server startet på http://localhost:%s/', port);
});
