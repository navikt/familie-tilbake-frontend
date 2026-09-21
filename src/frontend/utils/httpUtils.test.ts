import { AxiosError, AxiosHeaders } from 'axios';

import { erGjenforsøkbarHttpFeil, erServerFeil, skalGjenforsøke } from './httpUtils';

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

describe('erGjenforsøkbarHttpFeil', () => {
    test.each([400, 401, 403, 404, 409, 422])(
        'burde ikke gjenforsøke klientfeil %i',
        (status: number) => {
            expect(erGjenforsøkbarHttpFeil(lagAxiosFeil(status))).toBe(false);
        }
    );

    test.each([408, 425, 429])('burde gjenforsøke midlertidig klientfeil %i', (status: number) => {
        expect(erGjenforsøkbarHttpFeil(lagAxiosFeil(status))).toBe(true);
    });

    test('burde gjenforsøke serverfeil', () => {
        expect(erGjenforsøkbarHttpFeil(lagAxiosFeil(500))).toBe(true);
    });

    test('burde gjenforsøke feil uten statuskode, som nettverksfeil', () => {
        expect(erGjenforsøkbarHttpFeil(new Error('Network Error'))).toBe(true);
    });
});

describe('skalGjenforsøke', () => {
    test('burde ikke gjenforsøke 403 selv på første forsøk', () => {
        expect(skalGjenforsøke(0, lagAxiosFeil(403))).toBe(false);
    });

    test('burde gjenforsøke serverfeil inntil to ganger', () => {
        const feil = lagAxiosFeil(500);

        expect(skalGjenforsøke(0, feil)).toBe(true);
        expect(skalGjenforsøke(1, feil)).toBe(true);
        expect(skalGjenforsøke(2, feil)).toBe(false);
    });
});
