import type { UseMutationResult } from '@tanstack/react-query';

import { useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';

import { useSettBehandlingTilbakeTilFakta } from './useSettBehandlingTilbakeTilFakta';
import { Feil } from '../../../../api/feil';
import { RessursStatus } from '../../../../typer/ressurs';

const mockRequest = jest.fn();
const behandlingId = '123';

jest.mock('@tanstack/react-query', () => {
    return {
        useMutation: jest.fn(({ mutationFn, onSuccess }) => {
            const mutateAsync = async (behandlingId: string): Promise<UseMutationResult> => {
                const result = await mutationFn(behandlingId);
                if (onSuccess && result.status === RessursStatus.Suksess) {
                    await onSuccess(result);
                }
                return result;
            };

            return {
                mutate: mutateAsync,
                mutateAsync: mutateAsync,
            };
        }),
        useQueryClient: jest.fn(() => null),
    };
});

jest.mock('../../../../api/http/HttpProvider', () => ({
    useHttp: jest.fn(() => ({
        request: mockRequest,
    })),
}));

describe('useSettBehandlingTilbakeTilFakta', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Burde kaste Feil med status 400 når tom behandlingId er gitt', async () => {
        const { result } = renderHook(() => useSettBehandlingTilbakeTilFakta());

        await expect(result.current.mutate('')).rejects.toEqual(
            new Feil('Behandling id er påkrevd for å sette behandling tilbake til fakta.', 400)
        );
    });

    test('Burde håndtere tilbakestilling til fakta med status suksess', async () => {
        mockRequest.mockResolvedValueOnce({
            status: RessursStatus.Suksess,
            data: 'Behandlingen ble tilbakestilt til fakta',
        });
        const mockInvalidateQueries = jest.fn();
        (useQueryClient as jest.Mock).mockReturnValue({
            invalidateQueries: mockInvalidateQueries,
        });

        const { result } = renderHook(() => useSettBehandlingTilbakeTilFakta());

        const response = await result.current.mutateAsync(behandlingId);

        expect(mockRequest).toHaveBeenCalledWith({
            method: 'PUT',
            url: `/familie-tilbake/api/behandling/${behandlingId}/flytt-behandling-til-fakta`,
        });
        expect(response.status).toBe(RessursStatus.Suksess);
        response.status === RessursStatus.Suksess &&
            expect(response.data).toBe('Behandlingen ble tilbakestilt til fakta');
        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['behandling'] });
    });

    test('Burde håndtere 403 Forbidden', async () => {
        const mockFrontendFeilmelding =
            'Du har rollen BESLUTTER og trenger rollen FORVALTER for å utføre denne handlingen.';
        const httpStatusCode = 403;
        mockRequest.mockResolvedValueOnce({
            status: RessursStatus.Feilet,
            frontendFeilmelding: mockFrontendFeilmelding,
            httpStatusCode,
        });

        const { result } = renderHook(() => useSettBehandlingTilbakeTilFakta());

        await expect(result.current.mutateAsync(behandlingId)).rejects.toEqual(
            new Feil(mockFrontendFeilmelding, httpStatusCode)
        );

        expect(mockRequest).toHaveBeenCalled();
    });

    test('Burde håndtere uten frontendFeilmelding og httpStatusCode', async () => {
        mockRequest.mockResolvedValueOnce({
            status: RessursStatus.Feilet,
            frontendFeilmelding: '',
        });

        const { result } = renderHook(() => useSettBehandlingTilbakeTilFakta());

        await expect(result.current.mutateAsync(behandlingId)).rejects.toEqual(
            new Feil('Ukjent feil ved å sette behandling tilbake til fakta.', 500)
        );
        expect(mockRequest).toHaveBeenCalled();
    });
});
