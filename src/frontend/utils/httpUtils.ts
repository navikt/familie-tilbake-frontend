export const erServerFeil = (status?: number): boolean =>
    typeof status === 'number' && status >= 500 && status < 600;

const hentHttpStatus = (error: unknown): number | undefined => {
    if (typeof error !== 'object' || error === null) return undefined;

    const { status, response } = error as {
        status?: unknown;
        response?: { status?: unknown };
    };

    if (typeof status === 'number') return status;
    if (typeof response?.status === 'number') return response.status;
    return undefined;
};

const GJENFORSØKBARE_KLIENTFEIL = new Set([408, 425, 429]);

export const erGjenforsøkbarHttpFeil = (error: unknown): boolean => {
    const status = hentHttpStatus(error);
    if (status === undefined) return true;
    if (status >= 400 && status < 500) return GJENFORSØKBARE_KLIENTFEIL.has(status);
    return true;
};

const MAKS_ANTALL_FORSØK = 2;

export const skalGjenforsøke = (antallFeilendeForsøk: number, error: unknown): boolean =>
    antallFeilendeForsøk < MAKS_ANTALL_FORSØK && erGjenforsøkbarHttpFeil(error);
