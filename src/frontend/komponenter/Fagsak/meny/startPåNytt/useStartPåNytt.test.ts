import type { Http } from '../../../../api/http/HttpProvider';

import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { vi } from 'vitest';

import { useStartPåNytt } from './useStartPåNytt';
import { Feil } from '../../../../api/feil';
import { createTestQueryClient } from '../../../../testutils/queryTestUtils';
import { RessursStatus } from '../../../../typer/ressurs';

const mockRequest = vi.fn();
const behandlingId = '123';

vi.mock('../../../../api/http/HttpProvider', () => ({
    useHttp: (): Http => ({
        systemetLaster: () => false,
        request: mockRequest,
    }),
}));

const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement =>
    createElement(QueryClientProvider, { client: createTestQueryClient() }, children);

describe('useStartPåNytt', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('Burde kaste Feil med status 400 når tom behandlingId er gitt', async () => {
        const { result } = renderHook(() => useStartPåNytt(), { wrapper });

        await expect(result.current.mutateAsync('')).rejects.toEqual(
            new Feil('Behandling id er påkrevd for å starte på nytt.', 400)
        );
    });

    test('Burde håndtere tilbakestilling til fakta med status suksess', async () => {
        mockRequest.mockResolvedValueOnce({
            status: RessursStatus.Suksess,
            data: 'Behandlingen ble tilbakestilt til fakta',
        });

        const { result } = renderHook(() => useStartPåNytt(), { wrapper });

        const response = await result.current.mutateAsync(behandlingId);

        expect(mockRequest).toHaveBeenCalledWith({
            method: 'PUT',
            url: `/familie-tilbake/api/behandling/${behandlingId}/flytt-behandling-til-fakta`,
        });
        expect(response.status).toBe(RessursStatus.Suksess);
        if (response.status === RessursStatus.Suksess) {
            expect(response.data).toBe('Behandlingen ble tilbakestilt til fakta');
        }
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

        const { result } = renderHook(() => useStartPåNytt(), { wrapper });

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

        const { result } = renderHook(() => useStartPåNytt(), { wrapper });

        await expect(result.current.mutateAsync(behandlingId)).rejects.toEqual(
            new Feil('Ukjent feil ved å sette behandling tilbake til fakta.', 500)
        );
        expect(mockRequest).toHaveBeenCalled();
    });
});
