import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { captureException } from '@nais/apm';
import axios, { AxiosError, AxiosHeaders } from 'axios';

import { leggTilApmInterceptor, rapporterHttpFeil } from './apmHttpFeil';

vi.mock('@nais/apm', () => ({
    captureException: vi.fn(),
}));

const URL = '/familie-tilbake/api/behandling/a5cb9340-dc01-46e6-a0b0-2caa1c5a4192/fakta';

const lagFeil = (status?: number, code?: string): AxiosError => {
    const config: InternalAxiosRequestConfig = {
        url: URL,
        method: 'get',
        headers: new AxiosHeaders(),
    };
    const response = status ? ({ status, config } as AxiosResponse) : undefined;
    return new AxiosError('Feil', code, config, undefined, response);
};

describe('rapporterHttpFeil', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('burde rapportere serverfeil med metode, URL og status', () => {
        const feil = lagFeil(500, AxiosError.ERR_BAD_RESPONSE);

        rapporterHttpFeil(feil);

        expect(captureException).toHaveBeenCalledWith(feil, {
            context: {
                httpMethod: 'GET',
                url: URL,
                httpStatus: '500',
                errorCode: 'ERR_BAD_RESPONSE',
            },
        });
    });

    test('burde rapportere feil uten HTTP-respons uten å anta årsak', () => {
        const feil = lagFeil(undefined, AxiosError.ERR_NETWORK);

        rapporterHttpFeil(feil);

        expect(captureException).toHaveBeenCalledWith(feil, {
            context: {
                httpMethod: 'GET',
                url: URL,
                httpStatus: 'no HTTP response',
                errorCode: 'ERR_NETWORK',
            },
        });
    });

    test.each([
        ['klientfeil', lagFeil(404, AxiosError.ERR_BAD_REQUEST)],
        ['avbrutte kall', lagFeil(undefined, AxiosError.ERR_CANCELED)],
        ['feil som ikke kommer fra axios', new Error('Noe annet')],
    ])('burde ikke rapportere %s', (_, feil) => {
        rapporterHttpFeil(feil);

        expect(captureException).not.toHaveBeenCalled();
    });
});

describe('leggTilApmInterceptor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('burde rapportere feil fra instansen og sende feilen videre', async () => {
        const instans = axios.create({
            adapter: async (config: InternalAxiosRequestConfig) => {
                throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, config);
            },
        });
        leggTilApmInterceptor(instans);

        await expect(instans.get(URL)).rejects.toThrow('Network Error');

        expect(captureException).toHaveBeenCalledWith(
            expect.any(AxiosError),
            expect.objectContaining({ context: expect.objectContaining({ url: URL }) })
        );
    });
});
