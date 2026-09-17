import type { Vedtaksresultat } from '@/generated-new';

import { describe, expect, test } from 'vitest';

import { vedtaksresultatFarger } from './vedtaksresultat';

describe('vedtaksresultatFarger', () => {
    test('delvis tilbakebetaling har farge meta-purple', () => {
        const resultat: Vedtaksresultat = 'DelvisTilbakebetaling';
        expect(vedtaksresultatFarger[resultat]).toBe('meta-purple');
    });

    test('ingen tilbakebetaling har farge success', () => {
        const resultat: Vedtaksresultat = 'IngenTilbakebetaling';
        expect(vedtaksresultatFarger[resultat]).toBe('success');
    });

    test('full tilbakebetaling har farge brand-magenta', () => {
        const resultat: Vedtaksresultat = 'FullTilbakebetaling';
        expect(vedtaksresultatFarger[resultat]).toBe('brand-magenta');
    });
});
