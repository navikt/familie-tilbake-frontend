import type { FamilieRequest } from '../api/http/HttpProvider';
import type { Toggles } from '../context/toggles';
import type { Ressurs } from '../typer/ressurs';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useHttp } from '../api/http/HttpProvider';
import { ToggleName } from '../context/toggles';
import { useToggles } from '../context/TogglesContext';
import { RessursStatus } from '../typer/ressurs';

export const settBehandlingTilbakeTilFakta = async (
    request: FamilieRequest,
    behandlingId: string,
    toggles: Toggles
): Promise<Ressurs<string>> => {
    if (!behandlingId) {
        throw new Error('Behandling id er påkrevd for å sette behandling tilbake til fakta.');
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

    return useMutation({
        mutationFn: async (behandlingId: string) => {
            const response = await settBehandlingTilbakeTilFakta(request, behandlingId, toggles);
            console.log('Sett behandling tilbake til fakta:', response);

            if (response.status === RessursStatus.Suksess) {
                return response;
            }

            const feil = new Error(
                'frontendFeilmelding' in response && response.frontendFeilmelding
                    ? response.frontendFeilmelding
                    : 'Ukjent feil ved å sette behandling tilbake til fakta.'
            );
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (feil as any).httpStatus = 'httpStatus' in response ? response.httpStatus : 500;
            throw feil;
        },
        onSuccess: response => {
            if (response.status === RessursStatus.Suksess) {
                queryClient.invalidateQueries({ queryKey: ['behandling'] });
            }
        },
    });
};
