// Konfigurer appen før backend prøver å sette opp konfigurasjon

import { ISessionKonfigurasjon, IApi } from '@navikt/familie-backend';

const Environment = () => {
    if (process.env.ENV === 'local') {
        return {
            buildPath: 'frontend_development',
            namespace: 'local',
            proxyUrl: 'http://localhost:8030',
            historikkUrl: 'http://localhost:8050',
            baSakUrl: 'http://localhost:8001',
            forvalterRolle: 'dec3ee50-b683-4644-9507-520e8f054ac2',
        };
    } else if (process.env.ENV === 'e2e') {
        return {
            buildPath: 'frontend_production',
            namespace: 'e2e',
            proxyUrl: 'http://familie-tilbake:8030',
            historikkUrl: 'http://familie-historikk:8050',
            baSakUrl: 'http://familie-ba-sak-frontend:8000',
            forvalterRolle: 'temp',
            //Har ikke satt opp redis
        };
    } else if (process.env.ENV === 'preprod') {
        return {
            buildPath: 'frontend_production',
            namespace: 'preprod',
            proxyUrl: 'http://familie-tilbake',
            historikkUrl: 'http://familie-historikk',
            baSakUrl: 'https://barnetrygd.dev.adeo.no',
            redisUrl: 'familie-tilbake-frontend-redis',
            forvalterRolle: 'c62e908a-cf20-4ad0-b7b3-3ff6ca4bf38b',
        };
    }

    return {
        buildPath: 'frontend_production',
        namespace: 'production',
        proxyUrl: 'http://familie-tilbake',
        historikkUrl: 'http://familie-historikk',
        baSakUrl: 'https://barnetrygd.nais.adeo.no',
        redisUrl: 'familie-tilbake-frontend-redis',
        forvalterRolle: '3d718ae5-f25e-47a4-b4b3-084a97604c1d',
    };
};
const env = Environment();

export const sessionConfig: ISessionKonfigurasjon = {
    cookieSecret: [`${process.env.COOKIE_KEY1}`, `${process.env.COOKIE_KEY2}`],
    navn: 'familie-tilbake-v1',
    redisPassord: process.env.REDIS_PASSWORD,
    redisUrl: env.redisUrl,
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
export const forvalterRolle = env.forvalterRolle;

export const redirectRecords: Record<string, string> = {
    '/redirect/fagsystem/BA': env.baSakUrl,
};
