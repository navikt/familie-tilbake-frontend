import type { FamilieRequest } from '../../../../api/http/HttpProvider';
import type { Ressurs } from '../../../../typer/ressurs';
import type { UseMutationResult } from '@tanstack/react-query';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Feil } from '../../../../api/feil';
import { useHttp } from '../../../../api/http/HttpProvider';
import { RessursStatus } from '../../../../typer/ressurs';

const startPåNytt = async (
    request: FamilieRequest,
    behandlingId: string
): Promise<Ressurs<string>> => {
    if (!behandlingId) {
        throw new Feil('Behandling id er påkrevd for å starte på nytt.', 400);
    }
    return await request<void, string>({
        method: 'PUT',
        url: `/familie-tilbake/api/behandling/${behandlingId}/flytt-behandling-til-fakta`,
    });
};

export type StartPåNyttHook = UseMutationResult<Ressurs<string>, Feil, string, unknown>;

export const useStartPåNytt = (): StartPåNyttHook => {
    const { request } = useHttp();
    const queryClient = useQueryClient();

    return useMutation<Ressurs<string>, Feil, string>({
        mutationKey: ['startPåNytt'],
        mutationFn: async (behandlingId: string) => {
            const response = await startPåNytt(request, behandlingId);
            if (response.status === RessursStatus.Suksess) {
                return response;
            }
            const finnesFeilmelding =
                'frontendFeilmelding' in response && response.frontendFeilmelding;
            const finnesHttpStatusKode = 'httpStatusCode' in response;
            throw new Feil(
                finnesFeilmelding
                    ? response.frontendFeilmelding
                    : 'Ukjent feil ved å sette behandling tilbake til fakta.',
                finnesHttpStatusKode && response.httpStatusCode ? response.httpStatusCode : 500
            );
        },
        onSuccess: response => {
            if (response.status === RessursStatus.Suksess) {
                queryClient.invalidateQueries({ queryKey: ['behandling'] });
            }
        },
    });
};
