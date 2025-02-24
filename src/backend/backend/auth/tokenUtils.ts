import type { IApi } from '../typer';
import type { Request } from 'express';
import type { Client } from 'openid-client';

import { TokenSet } from 'openid-client';

import { LOG_LEVEL, logError, logInfo } from '../../logging/logging';
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
        LOG_LEVEL.INFO
    );
    return validAccessToken;
};

export interface UtledAccessTokenProps {
    authClient: Client;
    req: Request;
    api: IApi;
    promise: {
        resolve: (value: string) => void;
        reject: (reason: string | Error) => void;
    };
}

export const appendDefaultScope = (scope: string) => `${scope}/.default`;

const formatClientIdScopeForV2Clients = (clientId: string) =>
    appendDefaultScope(`api://${clientId}`);

const createOnBehalfOfScope = (api: IApi) => {
    if (api.scopes && api.scopes.length > 0) {
        return `${api.scopes.join(' ')}`;
    } else {
        return `${formatClientIdScopeForV2Clients(api.clientId)}`;
    }
};

const utledAccessToken = (props: UtledAccessTokenProps, retryCount: number) => {
    const { authClient, req, api, promise } = props;
    authClient
        .grant({
            assertion: req.session.passport.user.tokenSets[tokenSetSelfId].access_token,
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            requested_token_use: 'on_behalf_of',
            scope: createOnBehalfOfScope(api),
        })
        .then((tokenSet: TokenSet) => {
            if (!req.session) {
                throw Error('Mangler session på request.');
            }

            req.session.passport.user.tokenSets[api.clientId] = tokenSet;

            if (tokenSet.access_token) {
                promise.resolve(tokenSet.access_token);
            } else {
                promise.reject('Token ikke tilgjengelig');
            }
        })
        .catch((err: Error) => {
            const message = err.message;
            if (message.includes('invalid_grant')) {
                logInfo(`Bruker har ikke tilgang: ${message}`);
                promise.reject(err);
            } else if (retryCount > 0) {
                logInfo(`Kjører retry for uthenting av access token: ${message}`);
                utledAccessToken(props, retryCount - 1);
            } else {
                logError('Feil ved henting av obo token', err);
                promise.reject(err);
            }
        });
};

export const getOnBehalfOfAccessToken = (
    authClient: Client,
    req: Request,
    api: IApi
): Promise<string> => {
    const retryCount = 1;
    return new Promise((resolve, reject) => {
        if (hasValidAccessToken(req, api.clientId)) {
            const tokenSets = getTokenSetsFromSession(req);
            resolve(tokenSets[api.clientId].access_token);
        } else {
            if (!req.session) {
                throw Error('Session på request mangler.');
            }
            utledAccessToken({ authClient, req, api, promise: { resolve, reject } }, retryCount);
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
