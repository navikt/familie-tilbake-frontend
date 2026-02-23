import type { UseMutationResult } from '@tanstack/react-query';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import { Feil } from '~/api/feil';
import { useHttp, type FamilieRequest } from '~/api/http/HttpProvider';
import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { hentBehandlingQueryKey } from '~/generated/@tanstack/react-query.gen';
import { RessursStatus, type Ressurs } from '~/typer/ressurs';
import { useStegNavigering } from '~/utils/sider';

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

export type StartPåNyttHook = UseMutationResult<Ressurs<string>, Feil, void, unknown> & {
    dialogRef: React.RefObject<HTMLDialogElement | null>;
    åpneDialog: () => void;
};

export const useStartPåNytt = (): StartPåNyttHook => {
    const { request } = useHttp();
    const { behandlingId } = useBehandling();
    const { nullstillIkkePersisterteKomponenter } = useBehandlingState();
    const navigerTilBehandling = useStegNavigering();
    const queryClient = useQueryClient();
    const dialogRef = useRef<HTMLDialogElement>(null);

    const mutation = useMutation<Ressurs<string>, Feil, void>({
        mutationKey: ['startPåNytt'],
        mutationFn: async () => {
            nullstillIkkePersisterteKomponenter();
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
        onSuccess: async response => {
            if (response.status === RessursStatus.Suksess) {
                await queryClient.refetchQueries({
                    queryKey: hentBehandlingQueryKey({ path: { behandlingId } }),
                });
                await queryClient.refetchQueries({ queryKey: ['hentFaktaOmFeilutbetaling'] });
                navigerTilBehandling();
            }
        },
        onError: () => dialogRef.current?.close(),
    });

    return {
        ...mutation,
        dialogRef,
        åpneDialog: () => dialogRef.current?.showModal(),
    };
};
