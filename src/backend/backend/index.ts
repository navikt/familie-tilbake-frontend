import { Express, Router } from 'express';
import { Counter, Registry } from 'prom-client';
import { Client } from 'openid-client';
import { logError } from '../logging/logging';
import { ISessionKonfigurasjon } from './typer';
import { hentErforbindelsenTilRedisTilgjengelig } from './utils';
import passport from 'passport';
import { konfigurerMetrikker } from './metrikker';

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
function express() {
    throw new Error('Function not implemented.');
}
