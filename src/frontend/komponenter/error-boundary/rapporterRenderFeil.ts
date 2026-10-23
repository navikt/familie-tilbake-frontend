import type { ErrorInfo } from 'react';

import { captureException } from '@nais/apm';
import { isAxiosError } from 'axios';

import { ApiStatusError } from '@/utils/httpUtils';

/**
 * HTTP-feil rapporteres allerede av axios-interceptoren, og ApiStatusError med 4xx er
 * forventede tilstander (f.eks. manglende tilgang) som vises med egne feilsider.
 */
const erAlleredeHåndtert = (error: Error): boolean =>
    isAxiosError(error) || (error instanceof ApiStatusError && error.status < 500);

export const rapporterRenderFeil = (
    error: Error,
    errorInfo: ErrorInfo,
    context: Record<string, string> = {}
): void => {
    if (erAlleredeHåndtert(error)) return;

    captureException(error, {
        context: { ...context, componentStack: errorInfo.componentStack ?? '' },
    });
};
