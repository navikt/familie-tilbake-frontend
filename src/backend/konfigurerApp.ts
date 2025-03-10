import * as dotenv from 'dotenv';
dotenv.config();

// felles-backend bruker andre variabler enn det som blir satt opp av azureAd
const settAzureAdPropsFraEnv = () => {
    process.env.AAD_DISCOVERY_URL = process.env.AZURE_APP_WELL_KNOWN_URL;
    process.env.CLIENT_ID = process.env.AZURE_APP_CLIENT_ID;
    process.env.CLIENT_SECRET = process.env.AZURE_APP_CLIENT_SECRET;
};

const konfigurerAzure = () => {
    const callbackPath = '/auth/openid/callback';
    switch (process.env.ENV) {
        case 'local':
        case 'lokalt-mot-preprod':
            process.env.AAD_LOGOUT_REDIRECT_URL = `https://login.microsoftonline.com/navq.onmicrosoft.com/oauth2/logout?post_logout_redirect_uri=http:\\\\localhost:8000`;
            process.env.AAD_REDIRECT_URL = `http://localhost:8000${callbackPath}`;
            process.env.AAD_DISCOVERY_URL = `https://login.microsoftonline.com/navq.onmicrosoft.com/v2.0/.well-known/openid-configuration`;
            process.env.GRAPH_API = 'https://graph.microsoft.com/v1.0/me';
            break;
        case 'e2e':
            process.env.AAD_LOGOUT_REDIRECT_URL = `http://mock-oauth2-server:1111/v2.0/logout?post_logout_redirect_uri=http:\\\\localhost:8000`;
            process.env.AAD_REDIRECT_URL = `http://familie-tilbake-frontend:8000${callbackPath}`;
            process.env.AAD_DISCOVERY_URL = `http://mock-oauth2-server:1111/v2.0/.well-known/openid-configuration`;
            process.env.GRAPH_API = 'http://familie-mock-server:1337/graph/me';
            break;
        case 'preprod':
            process.env.AAD_LOGOUT_REDIRECT_URL = `https://login.microsoftonline.com/navq.onmicrosoft.com/oauth2/logout?post_logout_redirect_uri=https:\\\\tilbakekreving.ansatt.dev.nav.no`;
            process.env.AAD_REDIRECT_URL = `https://tilbakekreving.ansatt.dev.nav.no${callbackPath}`;
            process.env.GRAPH_API = 'https://graph.microsoft.com/v1.0/me';
            settAzureAdPropsFraEnv();
            break;
        case 'production':
            process.env.AAD_LOGOUT_REDIRECT_URL = `https://login.microsoftonline.com/navno.onmicrosoft.com/oauth2/logout?post_logout_redirect_uri=https:\\\\${process.env.TILBAKEKREVING_BASE_DOMAIN}`;
            process.env.AAD_REDIRECT_URL = `https://${process.env.TILBAKEKREVING_BASE_DOMAIN}${callbackPath}`;
            process.env.GRAPH_API = 'https://graph.microsoft.com/v1.0/me';
            settAzureAdPropsFraEnv();
            break;
        default:
            break;
    }
};

konfigurerAzure();
