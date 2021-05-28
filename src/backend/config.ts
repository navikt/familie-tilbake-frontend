// Konfigurer appen før backend prøver å sette opp konfigurasjon

import { ISessionKonfigurasjon, IApi } from '@navikt/familie-backend';

const Environment = () => {
    if (process.env.ENV === 'local') {
        return {
            buildPath: 'frontend_development',
            namespace: 'local',
            proxyUrl: 'http://localhost:8030',
            historikkUrl: 'http://localhost:8050',
        };
    } else if (process.env.ENV === 'e2e') {
        return {
            buildPath: 'frontend_production',
            namespace: 'e2e',
            proxyUrl: 'http://familie-tilbake:8030',
            historikkUrl: 'http://familie-historikk:8050',
            // redisUrl: 'familie-redis',
        };
    } else if (process.env.ENV === 'preprod') {
        return {
            buildPath: 'frontend_production',
            namespace: 'preprod',
            proxyUrl: 'https://familie-tilbake.dev-fss-pub.nais.io',
            historikkUrl: 'https://familie-historikk.dev.intern.nav.no',
            redisUrl: process.env.REDIS_HOST,
        };
    }

    return {
        buildPath: 'frontend_production',
        namespace: 'production',
        proxyUrl: 'https://familie-tilbake.prod-fss-pub.nais.io',
        historikkUrl: 'https://familie-historikk.intern.nav.no',
        redisUrl: process.env.REDIS_HOST,
    };
};
const env = Environment();

export const sessionConfig: ISessionKonfigurasjon = {
    cookieSecret: [`${process.env.COOKIE_KEY1}`, `${process.env.COOKIE_KEY2}`],
    navn: 'familie-tilbake-v1',
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
