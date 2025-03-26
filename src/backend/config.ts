// Konfigurer appen før backend prøver å sette opp konfigurasjon

import type { IAppConfig, ISessionKonfigurasjon, TexasConfig } from './backend/typer';

import * as dotenv from 'dotenv';

import { envVar } from './utils';

dotenv.config();

export const appConfig: IAppConfig = {
    sessionSecret: envVar('SESSION_SECRET'),
    backendApiScope: envVar('TILBAKE_SCOPE'),
    version: envVar('APP_VERSION'),
    graphApiUrl: 'https://graph.microsoft.com/v1.0/me',
};

const Environment = () => {
    if (process.env.ENV === 'local') {
        return {
            buildPath: 'frontend_development',
            proxyUrl: 'http://localhost:8030/api',
            baSakUrl: 'https://barnetrygd.ansatt.dev.nav.no',
            efSakUrl: 'https://ensligmorellerfar.ansatt.dev.nav.no/ekstern',
            ksSakUrl: 'https://kontantstotte.ansatt.dev.nav.no',
        };
    } else if (process.env.ENV === 'preprod') {
        return {
            buildPath: 'frontend_production',
            proxyUrl: 'http://tilbakekreving-backend/api',
            baSakUrl: 'https://barnetrygd.ansatt.dev.nav.no',
            efSakUrl: 'https://ensligmorellerfar.ansatt.dev.nav.no/ekstern',
            ksSakUrl: 'https://kontantstotte.ansatt.dev.nav.no',
        };
    } else if (process.env.ENV === 'lokalt-mot-preprod') {
        return {
            buildPath: 'frontend_development',
            proxyUrl: 'https://tilbakekreving-backend.intern.dev.nav.no/api',
            baSakUrl: 'https://barnetrygd.ansatt.dev.nav.no',
            efSakUrl: 'https://ensligmorellerfar.ansatt.dev.nav.no/ekstern',
            ksSakUrl: 'https://kontantstotte.ansatt.dev.nav.no',
        };
    }

    return {
        buildPath: 'frontend_production',
        proxyUrl: 'http://tilbakekreving-backend/api',
        baSakUrl: 'https://barnetrygd.intern.nav.no',
        efSakUrl: 'https://ensligmorellerfar.intern.nav.no/ekstern',
        ksSakUrl: 'https://kontantstotte.intern.nav.no',
    };
};
const env = Environment();

export const texasConfig: TexasConfig = {
    tokenEndpoint: envVar('NAIS_TOKEN_ENDPOINT'),
    tokenExchangeEndpoint: envVar('NAIS_TOKEN_EXCHANGE_ENDPOINT'),
    tokenIntrospectionEndpoint: envVar('NAIS_TOKEN_INTROSPECTION_ENDPOINT'),
};

export const sessionConfig: ISessionKonfigurasjon = {
    cookieSecret: [`${process.env.COOKIE_KEY1}`, `${process.env.COOKIE_KEY2}`],
    navn: 'tilbakekreving-backend-v1',
    valkeyFullUrl:
        process.env.ENV === 'local'
            ? process.env.VALKEY_URI_SESSIONS
            : `rediss://${envVar('VALKEY_HOST_SESSIONS')}:${envVar('VALKEY_PORT_SESSIONS')}`,
    valkeyBrukernavn: process.env.VALKEY_USERNAME_SESSIONS,
    valkeyPassord: process.env.VALKEY_PASSWORD_SESSIONS,
    secureCookie: !(process.env.ENV === 'local' || process.env.ENV === 'lokalt-mot-preprod'),
    sessionMaxAgeSekunder: 12 * 60 * 60,
};

if (!process.env.TILBAKE_SCOPE) {
    throw new Error('Scope mot tilbakekreving-backend er ikke konfigurert');
}

export const buildPath = env.buildPath;
export const proxyUrl = env.proxyUrl;

export const redirectRecords: Record<string, string> = {
    '/redirect/fagsystem/BA': env.baSakUrl,
    '/redirect/fagsystem/EF': env.efSakUrl,
    '/redirect/fagsystem/KONT': env.ksSakUrl,
};
