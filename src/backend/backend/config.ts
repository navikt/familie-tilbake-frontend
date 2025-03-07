import type { IAppConfig } from './typer';

import { envVar } from '../utils';

export const appConfig: IAppConfig = {
    clientId: envVar('CLIENT_ID'),
    clientSecret: envVar('CLIENT_SECRET'),
    discoveryUrl: envVar('AAD_DISCOVERY_URL'),
    logoutRedirectUri: envVar('AAD_LOGOUT_REDIRECT_URL'),
    redirectUri: envVar('AAD_REDIRECT_URL'),
    sessionSecret: envVar('SESSION_SECRET'),
    backendApiScope: envVar('TILBAKE_SCOPE'),
};
