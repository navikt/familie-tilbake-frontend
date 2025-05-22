import type { FamilieRequest } from './http/HttpProvider';

import { preferredAxios } from './axios';

type SystemBaseUrl = {
    aInntektUrl: string;
    gosysBaseUrl: string;
    modiaBaseUrl: string;
};

export const hentSystemUrl = async (): Promise<SystemBaseUrl> => {
    const response = await preferredAxios.get<SystemBaseUrl>('/system-url');
    return response.data;
};

export const hentAInntektUrl = async (
    request: FamilieRequest,
    personIdent?: string,
    fagsakId?: string,
    behandlingId?: string
): Promise<string | null> => {
    if (!personIdent) return null;
    const response = await request<void, string>({
        method: 'GET',
        url: '/familie-tilbake/api/arbeid-og-inntekt/brukerlenke',
        headers: {
            'x-person-ident': personIdent,
            ...(fagsakId && { 'x-fagsak-id': fagsakId }),
            ...(behandlingId && { 'x-behandling-id': behandlingId }),
        },
    });
    return response.status === 'SUKSESS' ? response.data : null;
};
