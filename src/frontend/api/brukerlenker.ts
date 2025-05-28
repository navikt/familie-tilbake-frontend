import type { FamilieRequest } from './http/HttpProvider';

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
    console.log('requesting AInntekt URL with:', request, personIdent, fagsakId, behandlingId);
    if (!personIdent) {
        return null;
    }
    const response = await request<void, BrukerlenkeResponse>({
        method: 'GET',
        url: '/familie-tilbake/api/brukerlenke/ainntekt',
        headers: {
            'x-person-ident': personIdent,
            ...(fagsakId && { 'x-fagsak-id': fagsakId }),
            ...(behandlingId && { 'x-behandling-id': behandlingId }),
        },
    })
        .then(response => {
            console.log('hentAInntektUrl response', response);
            if (response.status === 'SUKSESS') {
                return response.data.url;
            }
            return null;
        })
        .catch(error => {
            console.error('Error fetching AInntekt URL:', error);
            return null;
        });
    return response;
};
