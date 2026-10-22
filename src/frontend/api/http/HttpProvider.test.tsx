import type { AxiosResponse } from 'axios';
import type { ReactNode } from 'react';

import { captureException } from '@nais/apm';
import { renderHook, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';

import { preferredAxios } from './axios';
import { HttpProvider, useHttp } from './HttpProvider';

vi.mock('./axios', () => ({
    preferredAxios: { request: vi.fn() },
    håndterApiRespons: vi.fn(() => ({ status: 'FEILET' })),
}));

vi.mock('@nais/apm', () => ({
    captureException: vi.fn(),
}));

const lagWrapper = (setUautorisert: (httpStatus: number) => void) => {
    return ({ children }: { children: ReactNode }): ReactNode => (
        <HttpProvider setUautorisert={setUautorisert}>{children}</HttpProvider>
    );
};

const utførKallSomFeilerMed = async (feil: AxiosError): Promise<ReturnType<typeof vi.fn>> => {
    vi.mocked(preferredAxios.request).mockRejectedValue(feil);
    const setUautorisert = vi.fn();

    const { result } = renderHook(() => useHttp(), { wrapper: lagWrapper(setUautorisert) });
    await result.current.request({ url: '/familie-tilbake/api/noe', method: 'GET' });

    return setUautorisert;
};

describe('HttpProvider - utlogging ved 401', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('logger ut saksbehandler ved ekte 401', async () => {
        const feil = new AxiosError('Request failed with status code 401');
        feil.response = { status: 401 } as AxiosResponse;

        const setUautorisert = await utførKallSomFeilerMed(feil);

        await waitFor(() => expect(setUautorisert).toHaveBeenCalledWith(401));
        expect(captureException).not.toHaveBeenCalled();
    });

    test('sporer serverfeil uten å logge ut saksbehandler', async () => {
        const feil = new AxiosError(
            'Request failed with status code 500',
            AxiosError.ERR_BAD_RESPONSE
        );
        feil.response = { status: 500 } as AxiosResponse;

        const setUautorisert = await utførKallSomFeilerMed(feil);

        expect(setUautorisert).not.toHaveBeenCalled();
        expect(captureException).toHaveBeenCalledWith(feil, {
            context: { httpMethod: 'GET', httpStatus: '500', errorCode: 'ERR_BAD_RESPONSE' },
        });
    });

    test('sporer feil uten HTTP-respons uten å anta årsak', async () => {
        const feil = new AxiosError('Network Error');

        await utførKallSomFeilerMed(feil);

        expect(captureException).toHaveBeenCalledWith(feil, {
            context: {
                httpMethod: 'GET',
                httpStatus: 'no HTTP response',
                errorCode: 'unknown',
            },
        });
    });

    test('sporer ikke avbrutte forespørsler', async () => {
        const feil = new AxiosError('Request canceled', 'ERR_CANCELED');

        await utførKallSomFeilerMed(feil);

        expect(captureException).not.toHaveBeenCalled();
    });
});
