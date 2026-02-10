import type { Brevmottaker } from '../typer/Brevmottaker';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useHttp } from '../api/http/HttpProvider';
import { useBehandling } from '../context/BehandlingContext';
import { hentBehandlingQueryKey } from '../generated/@tanstack/react-query.gen';
import { RessursStatus } from '../typer/ressurs';

export const useBrevmottakerApi = (): {
    lagreBrevmottaker: (
        brevmottaker: Brevmottaker,
        mottakerId?: string
    ) => Promise<{ success: boolean; error?: string }>;
    loading: boolean;
    error: string | null;
    clearError: () => void;
} => {
    const queryClient = useQueryClient();
    const { behandlingId } = useBehandling();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { request } = useHttp();

    const lagreBrevmottaker = async (
        brevmottaker: Brevmottaker,
        mottakerId?: string
    ): Promise<{ success: boolean; error?: string }> => {
        setLoading(true);
        setError(null);

        try {
            const url = mottakerId
                ? `/familie-tilbake/api/brevmottaker/manuell/${behandlingId}/${mottakerId}`
                : `/familie-tilbake/api/brevmottaker/manuell/${behandlingId}`;

            const method = mottakerId ? 'PUT' : 'POST';

            const response = await request<Brevmottaker, void>({
                method,
                url,
                data: brevmottaker,
            });

            if (response.status !== RessursStatus.Suksess) {
                const errorMessage =
                    'frontendFeilmelding' in response
                        ? response.frontendFeilmelding
                        : 'Ukjent feil ved lagring';

                setError(errorMessage);
                return { success: false, error: errorMessage };
            }

            await queryClient.invalidateQueries({
                queryKey: hentBehandlingQueryKey({ path: { behandlingId: behandlingId } }),
            });
            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ukjent feil ved lagring';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const clearError = (): void => {
        setError(null);
    };

    return {
        lagreBrevmottaker,
        loading,
        error,
        clearError,
    };
};
