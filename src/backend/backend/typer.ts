export type SessionKonfigurasjon = {
    valkeyFullUrl?: string;
    valkeyBrukernavn?: string;
    valkeyPassord?: string;
    navn: string;
    secureCookie: boolean;
    sessionMaxAgeSekunder?: number;
    cookieSecret: string[] | string;
};

export type TexasConfig = {
    tokenEndpoint: string;
    tokenExchangeEndpoint: string;
    tokenIntrospectionEndpoint: string;
};

export type AppConfig = {
    sessionSecret: string;
    backendApiScope: string;
    version: string;
    graphApiUrl: string;
};

export type User = {
    displayName: string;
    email: string;
    enhet: string;
    identifier: string;
    navIdent: string;
};

declare module 'express-session' {
    interface Session {
        user: User | null;
    }
}
