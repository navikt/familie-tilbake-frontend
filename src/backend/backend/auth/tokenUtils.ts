import type { IApi } from '../typer';
import type { TexasClient } from './texas';
import type { Request } from 'express';

import { TokenSet } from 'openid-client';

import { LogLevel } from '../../logging/logging';
import { logRequest } from '../utils';

export const tokenSetSelfId = 'self';

export const getTokenSetsFromSession = (req: Request) => {
    if (req && req.session && req.session.passport) {
        return req.session.passport.user.tokenSets;
    }

    return undefined;
};

const loggOgReturnerOmTokenErGyldig = (req: Request, key: string, validAccessToken: boolean) => {
    logRequest(
        req,
        `Har ${validAccessToken ? 'gyldig' : 'ikke gyldig'} token for key '${key}'`,
        LogLevel.Info
    );
    return validAccessToken;
};

export interface UtledAccessTokenProps {
    authClient: TexasClient;
    req: Request;
    api: IApi;
    promise: {
        resolve: (value: string) => void;
        reject: (reason: Error | string) => void;
    };
}

export const appendDefaultScope = (scope: string) => `${scope}/.default`;

const utledAccessToken = async (props: UtledAccessTokenProps) => {
    const { authClient, req } = props;

    const response = await authClient.exchangeToken(
        req.session.passport.user.tokenSets[tokenSetSelfId].access_token,
        props.api.scopes[0]
    );
    return response.access_token;
};

export const getOnBehalfOfAccessToken = (
    authClient: TexasClient,
    req: Request,
    api: IApi
): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (hasValidAccessToken(req, api.clientId)) {
            const tokenSets = getTokenSetsFromSession(req);
            resolve(tokenSets[api.clientId].access_token);
        } else {
            if (!req.session) {
                throw Error('Session på request mangler.');
            }
            utledAccessToken({ authClient, req, api, promise: { resolve, reject } }).then(token =>
                resolve(token)
            );
        }
    });
};

export const hasValidAccessToken = (req: Request, key = tokenSetSelfId) => {
    const tokenSets = getTokenSetsFromSession(req);
    if (!tokenSets) {
        return loggOgReturnerOmTokenErGyldig(req, key, false);
    }
    const tokenSet = tokenSets[key];
    if (!tokenSet) {
        return loggOgReturnerOmTokenErGyldig(req, key, false);
    }
    return loggOgReturnerOmTokenErGyldig(req, key, erUtgått(new TokenSet(tokenSet)) === false);
};

// kallkjedene kan ta litt tid, og tokenet kan i corner-case gå ut i løpet av kjeden. Så innfører et buffer
// på 2 minutter.
const erUtgått = (tokenSet: TokenSet): boolean =>
    tokenSet.expired() || (tokenSet.expires_in !== undefined && tokenSet.expires_in < 120);
