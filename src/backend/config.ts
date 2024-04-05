// Konfigurer appen før backend prøver å sette opp konfigurasjon

import { ISessionKonfigurasjon, IApi } from '@navikt/familie-backend';

const Environment = () => {
    if (process.env.ENV === 'local') {
        return {
            buildPath: 'frontend_development',
            namespace: 'local',
            proxyUrl: 'http://localhost:8030/api',
            historikkUrl: 'http://localhost:8050',
            baSakUrl: 'http://localhost:8001',
            efSakUrl: 'http://localhost:8002/ekstern',
            ksSakUrl: 'http://localhost:8003',
        };
    } else if (process.env.ENV === 'e2e') {
        return {
            buildPath: 'frontend_production',
            namespace: 'e2e',
            proxyUrl: 'http://familie-tilbake:8030/api',
            historikkUrl: 'http://familie-historikk:8050',
            baSakUrl: 'http://familie-ba-sak-frontend:8000',
            efSakUrl: 'http://familie-ef-sak-frontend:8000/ekstern',
            ksSakUrl: 'http://familie-ks-sak-frontend:8000',
        };
    } else if (process.env.ENV === 'preprod') {
        return {
            buildPath: 'frontend_production',
            namespace: 'preprod',
            proxyUrl: 'http://familie-tilbake/api',
            historikkUrl: 'http://familie-historikk',
            baSakUrl: 'https://barnetrygd.intern.dev.nav.no',
            efSakUrl: 'https://ensligmorellerfar.intern.dev.nav.no/ekstern',
            ksSakUrl: 'https://kontantstotte.intern.dev.nav.no',
        };
    }

    return {
        buildPath: 'frontend_production',
        namespace: 'production',
        proxyUrl: 'http://familie-tilbake/api',
        historikkUrl: 'http://familie-historikk',
        baSakUrl: 'https://barnetrygd.intern.nav.no',
        efSakUrl: 'https://ensligmorellerfar.intern.nav.no/ekstern',
        ksSakUrl: 'https://kontantstotte.intern.nav.no',
    };
};
const env = Environment();

export const sessionConfig: ISessionKonfigurasjon = {
    cookieSecret: [`${process.env.COOKIE_KEY1}`, `${process.env.COOKIE_KEY2}`],
    navn: 'familie-tilbake-v1',
    redisFullUrl: process.env.REDIS_URI_SESSIONS,
    redisBrukernavn: process.env.REDIS_USERNAME_SESSIONS,
    redisPassord: process.env.REDIS_PASSWORD_SESSIONS,
    secureCookie: !(process.env.ENV === 'local' || process.env.ENV === 'e2e'),
    sessionMaxAgeSekunder: 12 * 60 * 60,
};

if (!process.env.FAMILIE_TILBAKE_CLIENT_ID) {
    throw new Error('Konfig mot familie-tilbake er ikke konfigurert');
}

if (!process.env.FAMILIE_HISTORIKK_CLIENT_ID) {
    throw new Error('Konfig mot familie-historikk er ikke konfigurert');
}

export const oboTilbakeConfig: IApi = {
    clientId: process.env.FAMILIE_TILBAKE_CLIENT_ID,
    scopes: [],
};

export const oboHistorikkConfig: IApi = {
    clientId: process.env.FAMILIE_HISTORIKK_CLIENT_ID,
    scopes: [],
};

export const buildPath = env.buildPath;
export const proxyUrl = env.proxyUrl;
export const historikkUrl = env.historikkUrl;
export const namespace = env.namespace;

export const redirectRecords: Record<string, string> = {
    '/redirect/fagsystem/BA': env.baSakUrl,
    '/redirect/fagsystem/EF': env.efSakUrl,
    '/redirect/fagsystem/KONT': env.ksSakUrl,
};
