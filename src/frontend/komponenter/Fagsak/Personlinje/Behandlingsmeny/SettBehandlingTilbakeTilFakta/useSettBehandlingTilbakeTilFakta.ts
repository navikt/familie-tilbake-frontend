import type { FamilieRequest } from '../../../../../api/http/HttpProvider';
import type { Toggles } from '../../../../../context/toggles';
import type { Ressurs } from '../../../../../typer/ressurs';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Feil } from '../../../../../api/Feil';
import { useHttp } from '../../../../../api/http/HttpProvider';
import { ToggleName } from '../../../../../context/toggles';
import { useToggles } from '../../../../../context/TogglesContext';
import { RessursStatus } from '../../../../../typer/ressurs';

const settBehandlingTilbakeTilFakta = async (
    request: FamilieRequest,
    behandlingId: string,
    toggles: Toggles
): Promise<Ressurs<string>> => {
    if (!behandlingId) {
        throw new Feil('Behandling id er påkrevd for å sette behandling tilbake til fakta.', 400);
    }
    const resettUrl = toggles[ToggleName.SaksbehanderKanResettebehandling]
        ? `/familie-tilbake/api/behandling/${behandlingId}/flytt-behandling-til-fakta`
        : `/familie-tilbake/api/forvaltning/behandling/${behandlingId}/flytt-behandling/v1`;

    return await request<void, string>({
        method: 'PUT',
        url: resettUrl,
    });
};

export const useSettBehandlingTilbakeTilFakta = () => {
    const { request } = useHttp();
    const { toggles } = useToggles();
    const queryClient = useQueryClient();

    return useMutation<Ressurs<string>, Feil, string>({
        mutationFn: async (behandlingId: string) => {
            const response = await settBehandlingTilbakeTilFakta(request, behandlingId, toggles);
            if (response.status === RessursStatus.Suksess) {
                return response;
            }

            throw new Feil(
                'frontendFeilmelding' in response && response.frontendFeilmelding
                    ? response.frontendFeilmelding
                    : 'Ukjent feil ved å sette behandling tilbake til fakta.',
                'httpStatusCode' in response && response.httpStatusCode
                    ? response.httpStatusCode
                    : 500
            );
        },
        onSuccess: response => {
            if (response.status === RessursStatus.Suksess) {
                queryClient.invalidateQueries({ queryKey: ['behandling'] });
            }
        },
    });
};
