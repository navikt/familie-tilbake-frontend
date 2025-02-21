import express, { Express, Request, Response, Router } from 'express';
import { Counter, Registry } from 'prom-client';
import { Client } from 'openid-client';
import { logError } from '../logging/logging';
import { ISessionKonfigurasjon } from './typer';
import { hentErforbindelsenTilRedisTilgjengelig } from './utils';
import passport from 'passport';
import { konfigurerMetrikker } from './metrikker';
import headers from './headers';
import konfigurerPassport from './auth/azure/passport';
import konfigurerSession from './auth/session';
import konfigurerRouter from './router';

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
    router: Router;
    prometheusRegistry: Registry;
}

export default async (
    sessionKonfigurasjon: ISessionKonfigurasjon,
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
            router = konfigurerRouter(azureAuthClient, prometheusTellere);

            return {
                app,
                azureAuthClient,
                router,
                prometheusRegistry,
            };
        })
        .catch((err: Error) => {
            logError('Feil ved konfigurasjon av azure', err);
            process.exit(1);
        });
};
