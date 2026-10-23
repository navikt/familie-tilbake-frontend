import type { AxiosError, AxiosInstance } from 'axios';

import { captureException } from '@nais/apm';
import { isAxiosError } from 'axios';

const skalRapporteres = (error: AxiosError): boolean =>
    error.code !== 'ERR_CANCELED' && (!error.response || error.response.status >= 500);

export const rapporterHttpFeil = (error: unknown): void => {
    if (!isAxiosError(error) || !skalRapporteres(error)) return;

    captureException(error, {
        context: {
            httpMethod: (error.config?.method ?? 'ukjent').toUpperCase(),
            url: error.config?.url ?? 'ukjent',
            httpStatus: error.response ? String(error.response.status) : 'no HTTP response',
            errorCode: error.code ?? 'unknown',
        },
    });
};

/**
 * Rapporterer serverfeil og feil uten HTTP-respons til APM. Klientfeil (4xx) og avbrutte
 * kall rapporteres ikke.
 */
export const leggTilApmInterceptor = (instance: Pick<AxiosInstance, 'interceptors'>): void => {
    instance.interceptors.response.use(undefined, (error: unknown) => {
        rapporterHttpFeil(error);
        return Promise.reject(error);
    });
};
