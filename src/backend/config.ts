// Konfigurer appen før backend prøver å sette opp konfigurasjon

import { appConfig, ISessionKonfigurasjon, IApi } from '@navikt/familie-backend';

const Environment = () => {
    if (process.env.ENV === 'local') {
        return {
            buildPath: '../../frontend_development',
            namespace: 'local',
            proxyUrl: 'http://localhost:8089',
        };
    } else if (process.env.ENV === 'e2e') {
        return {
            buildPath: '../../frontend_production',
            namespace: 'e2e',
            proxyUrl: 'http://familie-tilbake:8089',
            // redisUrl: 'familie-redis',
        };
    } else if (process.env.ENV === 'preprod') {
        return {
            buildPath: '../../frontend_production',
            namespace: 'preprod',
            proxyUrl: 'http://familie-tilbake',
            // redisUrl: 'familie-ba-sak-frontend-redis.default.svc.nais.local',
        };
    }

    return {
        buildPath: '../../frontend_production',
        namespace: 'production',
        proxyUrl: 'http://familie-tilbake',
        // redisUrl: 'familie-ba-sak-frontend-redis.default.svc.nais.local',
    };
};
const env = Environment();

export const sessionConfig: ISessionKonfigurasjon = {
    cookieSecret: [`${process.env.COOKIE_KEY1}`, `${process.env.COOKIE_KEY2}`],
    navn: 'familie-tilbake-v1',
    secureCookie: !(process.env.ENV === 'local' || process.env.ENV === 'e2e'),
    sessionMaxAgeSekunder: 12 * 60 * 60,
};

if (!process.env.TILBAKE_SCOPE) {
    throw new Error('Scope mot familie-tilbake er ikke konfigurert');
}

export const oboConfig: IApi = {
    clientId: appConfig.clientId,
    scopes: [process.env.TILBAKE_SCOPE],
};

export const buildPath = env.buildPath;
export const proxyUrl = env.proxyUrl;
export const namespace = env.namespace;
