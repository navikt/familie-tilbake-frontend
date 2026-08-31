import type { AxiosResponse } from 'axios';
import type { ReactNode } from 'react';

import { renderHook, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';

import { preferredAxios } from './axios';
import { HttpProvider, useHttp } from './HttpProvider';

vi.mock('./axios', () => ({
    preferredAxios: { request: vi.fn() },
    håndterApiRespons: vi.fn(() => ({ status: 'FEILET' })),
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
    });

    test('logger ikke ut ved 500', async () => {
        const feil = new AxiosError('Request failed with status code 500');
        feil.response = { status: 500 } as AxiosResponse;

        const setUautorisert = await utførKallSomFeilerMed(feil);

        expect(setUautorisert).not.toHaveBeenCalled();
    });
});
