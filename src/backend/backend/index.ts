import type { ISessionKonfigurasjon, TexasConfig } from './typer';
import type { Express, Request, Response, Router } from 'express';
import type { Counter, Registry } from 'prom-client';

import express from 'express';

import konfigurerSession from './auth/session';
import { TexasClient } from './auth/texas';
import headers from './headers';
import { konfigurerMetrikker } from './metrikker';
import konfigurerRouter from './router';
import { hentErforbindelsenTilRedisTilgjengelig } from './utils';

export * from './auth/authenticate';
export * from './auth/tokenUtils';
export * from './config';
export * from './typer';
export * from './utils';

export { Counter } from 'prom-client';
export interface IApp {
    app: Express;
    texasClient: TexasClient;
    router: Router;
    prometheusRegistry: Registry;
}

export default (
    sessionKonfigurasjon: ISessionKonfigurasjon,
    texasConfig: TexasConfig,
    prometheusTellere?: { [key: string]: Counter<string> }
): IApp => {
    const app = express();
    headers.setup(app);

    app.get('/isAlive', (_req: Request, res: Response) => {
        if (hentErforbindelsenTilRedisTilgjengelig()) {
            res.status(200).end();
        } else {
            res.status(500).end();
        }
    });
    app.get('/isReady', (_req: Request, res: Response) => {
        res.status(200).end();
    });
    const prometheusRegistry: Registry = konfigurerMetrikker(app, prometheusTellere);

    konfigurerSession(app, sessionKonfigurasjon);

    const texasClient = new TexasClient(texasConfig);
    const router = konfigurerRouter(texasClient);

    return {
        app,
        texasClient,
        router,
        prometheusRegistry,
    };
};
