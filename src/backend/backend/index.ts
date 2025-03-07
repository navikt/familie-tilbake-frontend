import type { ISessionKonfigurasjon, TexasConfig } from './typer';
import type { Express, Request, Response, Router } from 'express';
import type { Client } from 'openid-client';
import type { Counter, Registry } from 'prom-client';

import express from 'express';
import passport from 'passport';

import konfigurerPassport from './auth/azure/passport';
import konfigurerSession from './auth/session';
import { TexasClient } from './auth/texas';
import headers from './headers';
import { konfigurerMetrikker } from './metrikker';
import konfigurerRouter from './router';
import { hentErforbindelsenTilRedisTilgjengelig } from './utils';
import { logError } from '../logging/logging';

export * from './auth/authenticate';
export * from './auth/tokenUtils';
export * from './config';
export * from './typer';
export * from './utils';
export * from 'openid-client';
export { Counter } from 'prom-client';
export interface IApp {
    app: Express;
    azureAuthClient: Client;
    texasAuthClient: TexasClient;
    router: Router;
    prometheusRegistry: Registry;
}

export default async (
    sessionKonfigurasjon: ISessionKonfigurasjon,
    texasConfig: TexasConfig,
    prometheusTellere?: { [key: string]: Counter<string> }
): Promise<IApp> => {
    const app = express();
    let azureAuthClient!: Client;
    let router: Router;

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

    konfigurerSession(app, passport, sessionKonfigurasjon);

    return konfigurerPassport(passport)
        .then((authClient: Client) => {
            azureAuthClient = authClient;
            const texasClient = new TexasClient(texasConfig);
            router = konfigurerRouter(azureAuthClient, texasClient, prometheusTellere);

            return {
                app,
                azureAuthClient,
                texasAuthClient: texasClient,
                router,
                prometheusRegistry,
            };
        })
        .catch((err: Error) => {
            logError('Feil ved konfigurasjon av azure', err);
            process.exit(1);
        });
};
