import type { TexasClient } from './texas';
import type { Request } from 'express';

export const tokenSetSelfId = 'self';

export const getTokenSetsFromSession = (req: Request) => {
    if (req && req.session && req.session.passport) {
        return req.session.passport.user.tokenSets;
    }

    return undefined;
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
