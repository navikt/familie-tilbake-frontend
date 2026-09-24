import { AxiosError, AxiosHeaders } from 'axios';

import { erInnenforHentPåNyttStatusKode, erServerFeil, skalForsøkePåNytt } from './httpUtils';

const lagAxiosFeil = (status: number): AxiosError => {
    const config = { headers: new AxiosHeaders() };
    return new AxiosError('Feil', 'ERR_BAD_REQUEST', config, undefined, {
        status,
        statusText: '',
        headers: new AxiosHeaders(),
        config,
        data: undefined,
    });
};

describe('erServerFeil', () => {
    test('burde være sann for 5xx', () => {
        expect(erServerFeil(500)).toBe(true);
        expect(erServerFeil(503)).toBe(true);
    });

    test('burde være usann for 4xx og udefinert status', () => {
        expect(erServerFeil(403)).toBe(false);
        expect(erServerFeil(undefined)).toBe(false);
    });
});

describe('erInnenforHentPåNyttStatusKode', () => {
    test.each([400, 401, 403, 404, 409, 422])(
        'burde ikke gjenforsøke klientfeil %i',
        (status: number) => {
            expect(erInnenforHentPåNyttStatusKode(lagAxiosFeil(status))).toBe(false);
        }
    );

    test.each([408, 425, 429])(
        'burde hente på nytt for midlertidig klientfeil %i',
        (status: number) => {
            expect(erInnenforHentPåNyttStatusKode(lagAxiosFeil(status))).toBe(true);
        }
    );

    test('burde hente på nytt for serverfeil', () => {
        expect(erInnenforHentPåNyttStatusKode(lagAxiosFeil(500))).toBe(true);
    });

    test('burde hente på nytt for feil uten statuskode, som nettverksfeil', () => {
        expect(erInnenforHentPåNyttStatusKode(new Error('Network Error'))).toBe(true);
    });
});

describe('skalForsøkePåNytt', () => {
    test('burde ikke hente på nytt for 403 selv på første forsøk', () => {
        expect(skalForsøkePåNytt(0, lagAxiosFeil(403))).toBe(false);
    });

    test('burde hente på nytt for serverfeil inntil to ganger', () => {
        const feil = lagAxiosFeil(500);

        expect(skalForsøkePåNytt(0, feil)).toBe(true);
        expect(skalForsøkePåNytt(1, feil)).toBe(true);
        expect(skalForsøkePåNytt(2, feil)).toBe(false);
    });
});
