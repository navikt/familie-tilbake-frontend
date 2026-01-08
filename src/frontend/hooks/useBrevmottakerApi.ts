import type { Brevmottaker } from '../typer/Brevmottaker';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useHttp } from '../api/http/HttpProvider';
import { RessursStatus } from '../typer/ressurs';

export const useBrevmottakerApi = (): {
    lagreBrevmottaker: (
        behandlingId: string,
        brevmottaker: Brevmottaker,
        mottakerId?: string
    ) => Promise<{ success: boolean; error?: string }>;
    fjernBrevmottaker: (behandlingId: string, mottakerId: string) => Promise<boolean>;
    loading: boolean;
    error: string | null;
    clearError: () => void;
} => {
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { request } = useHttp();

    const lagreBrevmottaker = async (
        behandlingId: string,
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

            await queryClient.invalidateQueries({ queryKey: ['behandling', behandlingId] });
            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ukjent feil ved lagring';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const fjernBrevmottaker = async (
        behandlingId: string,
        mottakerId: string
    ): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const response = await request<void, void>({
                method: 'DELETE',
                url: `/familie-tilbake/api/brevmottaker/manuell/${behandlingId}/${mottakerId}`,
            });

            if (response.status !== RessursStatus.Suksess) {
                if ('frontendFeilmelding' in response) {
                    setError(response.frontendFeilmelding);
                } else {
                    setError('Ukjent feil ved sletting');
                }
                return false;
            }

            await queryClient.invalidateQueries({ queryKey: ['behandling', behandlingId] });
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ukjent feil ved sletting';
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const clearError = (): void => {
        setError(null);
    };

    return {
        lagreBrevmottaker,
        fjernBrevmottaker,
        loading,
        error,
        clearError,
    };
};
