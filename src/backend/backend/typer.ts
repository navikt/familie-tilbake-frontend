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
    sessionSecret: string;
    backendApiScope: string;
    version: string;
    graphApiUrl: string;
}

interface User {
    displayName: string;
    email: string;
    enhet: string;
    identifier: string;
    navIdent: string;
}

declare module 'express-session' {
    interface Session {
        user: User;
        // eslint-disable-next-line
        passport: any;
        redirectUrl: string;
    }
}
