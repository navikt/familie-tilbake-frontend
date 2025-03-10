// Konfigurer appen før backend prøver å sette opp konfigurasjon

import type { ISessionKonfigurasjon, TexasConfig } from './backend/typer';

import { envVar } from './utils';

const Environment = () => {
    if (process.env.ENV === 'local') {
        return {
            buildPath: 'frontend_development',
            namespace: 'local',
            proxyUrl: 'http://localhost:8030/api',
            baSakUrl: 'http://localhost:8001',
            efSakUrl: 'http://localhost:8002/ekstern',
            ksSakUrl: 'http://localhost:8003',
        };
    } else if (process.env.ENV === 'e2e') {
        return {
            buildPath: 'frontend_production',
            namespace: 'e2e',
            proxyUrl: 'http://tilbakekreving-backend:8030/api',
            baSakUrl: 'http://familie-ba-sak-frontend:8000',
            efSakUrl: 'http://familie-ef-sak-frontend:8000/ekstern',
            ksSakUrl: 'http://familie-ks-sak-frontend:8000',
        };
    } else if (process.env.ENV === 'preprod') {
        return {
            buildPath: 'frontend_production',
            namespace: 'preprod',
            proxyUrl: 'http://tilbakekreving-backend/api',
            baSakUrl: 'https://barnetrygd.ansatt.dev.nav.no',
            efSakUrl: 'https://ensligmorellerfar.ansatt.dev.nav.no/ekstern',
            ksSakUrl: 'https://kontantstotte.ansatt.dev.nav.no',
        };
    } else if (process.env.ENV === 'lokalt-mot-preprod') {
        return {
            buildPath: 'frontend_development',
            namespace: 'local',
            proxyUrl: 'https://tilbakekreving-backend.intern.dev.nav.no/api',
            baSakUrl: 'https://barnetrygd.ansatt.dev.nav.no',
            efSakUrl: 'https://ensligmorellerfar.ansatt.dev.nav.no/ekstern',
            ksSakUrl: 'https://kontantstotte.ansatt.dev.nav.no',
        };
    }

    return {
        buildPath: 'frontend_production',
        namespace: 'production',
        proxyUrl: process.env.TILBAKEKREVING_SVC_URL ?? 'http://tilbakekreving-backend/api',
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
    redisFullUrl: process.env.REDIS_URI_SESSIONS,
    redisBrukernavn: process.env.REDIS_USERNAME_SESSIONS,
    redisPassord: process.env.REDIS_PASSWORD_SESSIONS,
    secureCookie: !(
        process.env.ENV === 'local' ||
        process.env.ENV === 'e2e' ||
        process.env.ENV === 'lokalt-mot-preprod'
    ),
    sessionMaxAgeSekunder: 12 * 60 * 60,
};

if (!process.env.TILBAKE_SCOPE) {
    throw new Error('Scope mot tilbakekreving-backend er ikke konfigurert');
}

export const buildPath = env.buildPath;
export const proxyUrl = env.proxyUrl;
export const namespace = env.namespace;

export const redirectRecords: Record<string, string> = {
    '/redirect/fagsystem/BA': env.baSakUrl,
    '/redirect/fagsystem/EF': env.efSakUrl,
    '/redirect/fagsystem/KONT': env.ksSakUrl,
};
