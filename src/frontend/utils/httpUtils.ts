export const erServerFeil = (status?: number): boolean =>
    typeof status === 'number' && status >= 500 && status < 600;

export class ApiStatusError extends Error {
    constructor(
        public readonly status: number,
        public readonly feilmelding?: string
    ) {
        super(`API-kallet feilet med status ${status}`);
        this.name = 'ApiStatusError';
    }
}

export const hentHttpStatus = (error: unknown): number | undefined => {
    if (typeof error !== 'object' || error === null) return undefined;

    const { status, response } = error as {
        status?: unknown;
        response?: { status?: unknown };
    };

    if (typeof status === 'number') return status;
    if (typeof response?.status === 'number') return response.status;
    return undefined;
};

export const hentFeilmelding = (error: unknown): string | undefined => {
    if (error instanceof ApiStatusError) return error.feilmelding;
    if (typeof error !== 'object' || error === null) return undefined;

    const { response } = error as {
        response?: { data?: { frontendFeilmelding?: unknown; melding?: unknown } };
    };
    const { frontendFeilmelding, melding } = response?.data ?? {};
    if (typeof frontendFeilmelding === 'string') return frontendFeilmelding;
    if (typeof melding === 'string') return melding;
    return undefined;
};

const FORSØKES_PÅ_NYTT_KLIENTFEIL = new Set([408, 425, 429]);

export const erInnenforHentPåNyttStatusKode = (error: unknown): boolean => {
    const status = hentHttpStatus(error);
    if (status === undefined) return true;
    if (status >= 400 && status < 500) return FORSØKES_PÅ_NYTT_KLIENTFEIL.has(status);
    return true;
};

const MAKS_ANTALL_FORSØK = 2;

export const skalForsøkePåNytt = (antallFeilendeForsøk: number, error: unknown): boolean =>
    antallFeilendeForsøk < MAKS_ANTALL_FORSØK && erInnenforHentPåNyttStatusKode(error);
