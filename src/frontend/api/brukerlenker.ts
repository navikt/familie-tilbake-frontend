import type { FamilieRequest } from './http/HttpProvider';

import { RessursStatus } from '~/typer/ressurs';

import { preferredAxios } from './axios';

type BrukerlenkerResponse = {
    aInntektUrl: string;
    gosysBaseUrl: string;
    modiaBaseUrl: string;
};

type BrukerlenkeResponse = {
    url: string;
};

export const hentBrukerlenkeBaseUrl = async (): Promise<BrukerlenkerResponse> => {
    const response = await preferredAxios.get<BrukerlenkerResponse>('/brukerlenker');
    return response.data;
};

export const hentAInntektUrl = async (
    request: FamilieRequest,
    personIdent?: string,
    fagsakId?: string,
    behandlingId?: string
): Promise<string | null> => {
    if (!personIdent) {
        return null;
    }

    const response = await request<void, BrukerlenkeResponse>({
        method: 'GET',
        url: '/familie-tilbake/api/brukerlenke',
        headers: {
            'x-person-ident': personIdent,
            ...(fagsakId && { 'x-fagsak-id': fagsakId }),
            ...(behandlingId && { 'x-behandling-id': behandlingId }),
        },
    });

    return response.status === RessursStatus.Suksess ? response.data.url : null;
};
