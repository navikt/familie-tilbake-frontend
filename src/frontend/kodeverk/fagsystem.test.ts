import { describe, expect, test } from 'vitest';

import { tilFagsystem } from './fagsystem';

describe('tilFagsystem', () => {
    test('burde godta fagsystem definert i OpenAPI-spec-en', () => {
        expect(tilFagsystem('BA')).toBe('BA');
        expect(tilFagsystem('EF')).toBe('EF');
        expect(tilFagsystem('TP')).toBe('TP');
    });

    test('burde oversette KS-alias til KONT', () => {
        expect(tilFagsystem('KS')).toBe('KONT');
    });

    test('burde avvise ukjent fagsystem', () => {
        expect(tilFagsystem('TULL')).toBeUndefined();
    });

    test('burde avvise arvede objektegenskaper', () => {
        expect(tilFagsystem('toString')).toBeUndefined();
        expect(tilFagsystem('constructor')).toBeUndefined();
    });

    test('burde være case-sensitiv', () => {
        expect(tilFagsystem('ba')).toBeUndefined();
    });

    test('burde håndtere manglende verdi', () => {
        expect(tilFagsystem(undefined)).toBeUndefined();
        expect(tilFagsystem('')).toBeUndefined();
    });
});
