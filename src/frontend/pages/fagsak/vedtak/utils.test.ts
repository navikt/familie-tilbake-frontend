import { describe, expect, test } from 'vitest';

import { elementArrayTilTekst, tekstTilElementArray } from './utils';

describe('elementArrayTilTekst', () => {
    test('konverterer ett element til tekst', () => {
        const input = [{ type: 'rentekst' as const, tekst: 'Dette er en tekst' }];
        const result = elementArrayTilTekst(input);

        expect(result).toBe('Dette er en tekst');
    });

    test('konverterer flere elementer til tekst med dobbelt linjeskift', () => {
        const input = [
            { type: 'rentekst' as const, tekst: 'Første avsnitt' },
            { type: 'rentekst' as const, tekst: 'Andre avsnitt' },
            { type: 'rentekst' as const, tekst: 'Tredje avsnitt' },
        ];
        const result = elementArrayTilTekst(input);

        expect(result).toBe('Første avsnitt\n\nAndre avsnitt\n\nTredje avsnitt');
    });
});

describe('tekstTilElementArray', () => {
    test('konverterer en enkel tekst til element', () => {
        const result = tekstTilElementArray('Dette er en tekst');

        expect(result).toEqual([{ type: 'rentekst', tekst: 'Dette er en tekst' }]);
    });

    test('konverterer tekst med dobbelt linjeskift til flere elementer', () => {
        const result = tekstTilElementArray('Første avsnitt\n\nAndre avsnitt\n\nTredje avsnitt');

        expect(result).toEqual([
            { type: 'rentekst', tekst: 'Første avsnitt' },
            { type: 'rentekst', tekst: 'Andre avsnitt' },
            { type: 'rentekst', tekst: 'Tredje avsnitt' },
        ]);
    });

    test('håndterer flere påfølgende linjeskift som ett skille', () => {
        const result = tekstTilElementArray('Første\n\n\n\nAndre\n\n\n\n\nTredje');

        expect(result).toEqual([
            { type: 'rentekst', tekst: 'Første' },
            { type: 'rentekst', tekst: 'Andre' },
            { type: 'rentekst', tekst: 'Tredje' },
        ]);
    });

    test('bevarer enkelt linjeskift innenfor samme element', () => {
        const result = tekstTilElementArray('Første linje\nAndre linje\n\nNytt avsnitt');

        expect(result).toEqual([
            { type: 'rentekst', tekst: 'Første linje\nAndre linje' },
            { type: 'rentekst', tekst: 'Nytt avsnitt' },
        ]);
    });
});
