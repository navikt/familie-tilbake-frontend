import type { Periode } from '@/generated';

import { kanSplitte } from './utils';

describe('Vilkårsvurdering - utils - kanSplitte', () => {
    // test('kanSplitte på dagsytelser', () => {

    // });

    describe('Meldekortytelse', () => {
        test('kan splitte på to måneder innenfor periode', () => {
            const periode = {
                fom: '2026-06-01',
                tom: '2026-06-28',
            } satisfies Periode;
            const meldekortPeriode1 = {
                fom: '2026-06-01',
                tom: '2026-06-14',
            } satisfies Periode;
            const meldekortPeriode2 = {
                fom: '2026-06-15',
                tom: '2026-06-28',
            } satisfies Periode;

            const vilkårsperioder = [meldekortPeriode1, meldekortPeriode2];

            expect(kanSplitte(periode, vilkårsperioder)).toBe(true);
            expect(kanSplitte(periode, vilkårsperioder)).toBe(true);
        });

        test('kan ikke splitte på to måneder hvor en er utenfor periode', () => {
            const periode = {
                fom: '2026-06-15',
                tom: '2026-06-28',
            } satisfies Periode;
            const meldekortPeriode1 = {
                fom: '2026-06-01',
                tom: '2026-06-14',
            } satisfies Periode;
            const meldekortPeriode2 = {
                fom: '2026-06-15',
                tom: '2026-07-28',
            } satisfies Periode;

            const vilkårsperioder = [meldekortPeriode1, meldekortPeriode2];

            expect(kanSplitte(periode, vilkårsperioder)).toBe(false);
        });
    });
    describe('Månedsytelse', () => {
        test('kan splitte på månedsytelser', () => {
            const periode = {
                fom: '2026-06-01',
                tom: '2026-07-31',
            } satisfies Periode;
            const månedsperiode1 = {
                fom: '2026-06-01',
                tom: '2026-06-30',
            } satisfies Periode;
            const månedsperiode2 = {
                fom: '2026-07-01',
                tom: '2026-07-31',
            } satisfies Periode;

            const vilkårsperioder = [månedsperiode1, månedsperiode2];

            expect(kanSplitte(periode, vilkårsperioder)).toBe(true);
        });

        test('kan ikke splitte på månedsytelser hvis det bare er en månedsytelse i perioden', () => {
            const periode = {
                fom: '2026-06-01',
                tom: '2026-06-30',
            } satisfies Periode;
            const månedsperiode = {
                fom: '2026-06-01',
                tom: '2026-06-30',
            } satisfies Periode;

            const vilkårsperioder = [månedsperiode];

            expect(kanSplitte(periode, vilkårsperioder)).toBe(false);
        });
    });
});
