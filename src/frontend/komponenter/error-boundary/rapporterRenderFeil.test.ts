import type { ErrorInfo } from 'react';

import { captureException } from '@nais/apm';
import { AxiosError } from 'axios';

import { ApiStatusError } from '@/utils/httpUtils';

import { rapporterRenderFeil } from './rapporterRenderFeil';

vi.mock('@nais/apm', () => ({
    captureException: vi.fn(),
}));

const errorInfo: ErrorInfo = { componentStack: '\n    at Komponent' };

describe('rapporterRenderFeil', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('burde rapportere uventede feil med kontekst og komponentstack', () => {
        const feil = new TypeError('Cannot read properties of undefined');

        rapporterRenderFeil(feil, errorInfo, { steg: 'FAKTA' });

        expect(captureException).toHaveBeenCalledWith(feil, {
            context: { steg: 'FAKTA', componentStack: '\n    at Komponent' },
        });
    });

    test('burde rapportere ApiStatusError med serverfeil', () => {
        const feil = new ApiStatusError(500);

        rapporterRenderFeil(feil, errorInfo);

        expect(captureException).toHaveBeenCalledWith(feil, expect.anything());
    });

    test.each([
        ['axios-feil som allerede er rapportert av interceptoren', new AxiosError('Network Error')],
        ['forventet manglende tilgang', new ApiStatusError(403)],
    ])('burde ikke rapportere %s', (_, feil) => {
        rapporterRenderFeil(feil, errorInfo);

        expect(captureException).not.toHaveBeenCalled();
    });
});
