import type { Vedtaksresultat } from '~/generated-new/types.gen';

import { describe, expect, test } from 'vitest';

import { vedtaksresultatFarger } from './vedtaksresultatFarger';

describe('vedtaksresultatFarger', () => {
    test('delvis tilbakebetaling har farge meta-purple', () => {
        const resultat: Vedtaksresultat = 'DelvisTilbakebetaling';
        expect(vedtaksresultatFarger[resultat]).toBe('meta-purple');
    });

    test('ingen tilbakebetaling har farge brand-beige', () => {
        const resultat: Vedtaksresultat = 'IngenTilbakebetaling';
        expect(vedtaksresultatFarger[resultat]).toBe('brand-beige');
    });

    test('full tilbakebetaling har farge meta-lime', () => {
        const resultat: Vedtaksresultat = 'FullTilbakebetaling';
        expect(vedtaksresultatFarger[resultat]).toBe('meta-lime');
    });
});
