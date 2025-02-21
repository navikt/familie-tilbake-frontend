import { Client, UserinfoResponse } from 'openid-client';

import { logInfo } from '../../../logging/logging';
import azure from './azure';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async (passport: any): Promise<Client> => {
    logInfo('Konfigurerer passport');
    const azureAuthClient: Client = await azure.hentClient();
    const azureOidcStrategy = azure.strategy(azureAuthClient);

    passport.serializeUser(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (user: UserinfoResponse, done: (err: any, user?: UserinfoResponse) => void) =>
            done(undefined, user)
    );
    passport.deserializeUser(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (user: UserinfoResponse, done: (err: any, user?: UserinfoResponse) => void) =>
            done(undefined, user)
    );
    passport.use('azureOidc', azureOidcStrategy);

    return azureAuthClient;
};
