export interface ISessionKonfigurasjon {
    redisUrl?: string;
    redisFullUrl?: string;
    redisBrukernavn?: string;
    redisPassord?: string;
    navn: string;
    secureCookie: boolean;
    sessionMaxAgeSekunder?: number;
    cookieSecret: string[] | string;
}
export type TexasConfig = {
    tokenEndpoint: string;
    tokenExchangeEndpoint: string;
    tokenIntrospectionEndpoint: string;
};

export interface IAppConfig {
    discoveryUrl: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    logoutRedirectUri: string;
    sessionSecret: string;
    backendApiScope: string;
}

export interface User {
    displayName: string;
    email: string;
    enhet: string;
    identifier: string;
    navIdent: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    groups: any;
}

declare module 'express-session' {
    interface Session {
        user: User;
        // eslint-disable-next-line
        passport: any;
        redirectUrl: string;
    }
}
