import type { FamilieRequest } from './http/HttpProvider';

import { preferredAxios } from './axios';

type Brukerlenker = {
    aInntektUrl: string;
    gosysBaseUrl: string;
    modiaBaseUrl: string;
};

type BrukerlenkeResponse = {
    url: string;
};

export const hentBrukerlenkeBaseUrl = async (): Promise<Brukerlenker> => {
    const response = await preferredAxios.get<Brukerlenker>('/brukerlenke');
    return response.data;
};

export const hentAInntektUrl = async (
    request: FamilieRequest,
    personIdent?: string,
    fagsakId?: string,
    behandlingId?: string
): Promise<string | null> => {
    if (!personIdent) return null;
    const response = await request<void, BrukerlenkeResponse>({
        method: 'GET',
        url: '/familie-tilbake/api/brukerlenke/ainntekt',
        headers: {
            'x-person-ident': personIdent,
            ...(fagsakId && { 'x-fagsak-id': fagsakId }),
            ...(behandlingId && { 'x-behandling-id': behandlingId }),
        },
    });
    return response.status === 'SUKSESS' ? response.data.url : null;
};
