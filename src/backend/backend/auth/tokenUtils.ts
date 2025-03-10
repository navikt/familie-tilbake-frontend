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

export const appendDefaultScope = (scope: string) => `${scope}/.default`;

const utledAccessToken = async (texasClient: TexasClient, req: Request, scope: string) => {
    const response = await texasClient.exchangeToken(
        req.session.passport.user.tokenSets[tokenSetSelfId].access_token,
        scope
    );
    return response.access_token;
};

export const getOnBehalfOfAccessToken = async (
    texasClient: TexasClient,
    req: Request,
    scope: string
): Promise<string> => {
    return await utledAccessToken(texasClient, req, scope);
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
