export const erServerFeil = (status?: number): boolean =>
    typeof status === 'number' && status >= 500 && status < 600;
