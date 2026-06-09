import type { Periode } from '@/generated';

import { hentSplittedePerioder, kanSplitte } from './utils';

describe('Vilkårsvurdering - utils', () => {
    describe('kanSplitte', () => {
        describe('kan splitte når', () => {
            test('to vilkårsperioder er innenfor periode', () => {
                const periode = {
                    fom: '2026-06-01',
                    tom: '2026-06-28',
                } satisfies Periode;

                const vilkårsperioder = [
                    {
                        fom: '2026-06-01',
                        tom: '2026-06-14',
                    },
                    {
                        fom: '2026-06-15',
                        tom: '2026-06-28',
                    },
                ] satisfies Periode[];

                expect(kanSplitte(periode, vilkårsperioder)).toBe(true);
            });

            test('det er 3 eller mer vilkårsperioder innenfor', () => {
                const periode = {
                    fom: '2026-06-01',
                    tom: '2026-08-31',
                } satisfies Periode;
                const perioder = [
                    { fom: '2026-06-01', tom: '2026-06-30' },
                    { fom: '2026-07-01', tom: '2026-07-31' },
                    { fom: '2026-08-01', tom: '2026-08-31' },
                ];

                expect(kanSplitte(periode, perioder)).toBe(true);
            });
        });

        describe('false', () => {
            test('kan ikke splitte når vilkårsperioder er tom', () => {
                const periode = {
                    fom: '2026-06-01',
                    tom: '2026-06-30',
                } satisfies Periode;
                const vilkårsperioder: Periode[] = [];

                expect(kanSplitte(periode, vilkårsperioder)).toBe(false);
            });

            test('kan ikke splitte når det bare er 1 vilkårsperiode innenfor', () => {
                const periode = {
                    fom: '2026-06-01',
                    tom: '2026-06-30',
                } satisfies Periode;
                const vilkårsperioder = [
                    { fom: '2026-06-01', tom: '2026-06-30' } satisfies Periode,
                ];

                expect(kanSplitte(periode, vilkårsperioder)).toBe(false);
            });

            test('kan ikke splitte når vilkårsperiode ligger helt utenfor periode', () => {
                const periode = {
                    fom: '2026-06-01',
                    tom: '2026-06-14',
                } satisfies Periode;
                const vilkårsperioder = [
                    { fom: '2026-06-01', tom: '2026-06-14' } satisfies Periode,
                    { fom: '2026-06-15', tom: '2026-06-28' } satisfies Periode,
                ];

                expect(kanSplitte(periode, vilkårsperioder)).toBe(false);
            });
        });
    });

    describe('hentSplittedePerioder', () => {
        describe('returnerer splittede perioder når', () => {
            test('splittDato er gyldig', () => {
                const periode = {
                    fom: '2026-06-01',
                    tom: '2026-07-31',
                } satisfies Periode;
                const vilkårsperioder = [
                    { fom: '2026-06-01', tom: '2026-06-30' } satisfies Periode,
                    { fom: '2026-07-01', tom: '2026-07-31' } satisfies Periode,
                ];
                const splittDato = new Date('2026-07-01');

                const resultat = hentSplittedePerioder(periode, vilkårsperioder, splittDato);

                expect(resultat).toHaveLength(2);
                expect(resultat[0]).toEqual(vilkårsperioder[0]);
                expect(resultat[1]).toEqual(vilkårsperioder[1]);
            });

            test('splittDato er fom av tredje periode', () => {
                const periode = {
                    fom: '2026-06-01',
                    tom: '2026-08-31',
                } satisfies Periode;
                const vilkårsperioder = [
                    { fom: '2026-06-01', tom: '2026-06-30' } satisfies Periode,
                    { fom: '2026-07-01', tom: '2026-07-31' } satisfies Periode,
                    { fom: '2026-08-01', tom: '2026-08-31' } satisfies Periode,
                ];
                const splittDato = new Date('2026-08-01');

                const resultat = hentSplittedePerioder(periode, vilkårsperioder, splittDato);

                expect(resultat).toHaveLength(2);
                expect(resultat[0].tom).toBe('2026-07-31');
                expect(resultat[1].fom).toBe('2026-08-01');
            });
        });

        describe('returnerer tom array når', () => {
            test('splittDato er undefined', () => {
                const periode = {
                    fom: '2026-06-01',
                    tom: '2026-07-31',
                } satisfies Periode;
                const vilkårsperioder = [
                    { fom: '2026-06-01', tom: '2026-06-30' } satisfies Periode,
                    { fom: '2026-07-01', tom: '2026-07-31' } satisfies Periode,
                ];

                const resultat = hentSplittedePerioder(periode, vilkårsperioder, undefined);

                expect(resultat).toEqual([]);
            });

            test('splittDato ligger før noen vilkårsperiode', () => {
                const periode = {
                    fom: '2026-06-01',
                    tom: '2026-07-31',
                } satisfies Periode;
                const vilkårsperioder = [
                    { fom: '2026-06-15', tom: '2026-06-30' } satisfies Periode,
                    { fom: '2026-07-01', tom: '2026-07-31' } satisfies Periode,
                ];
                const splittDato = new Date('2026-06-01');

                const resultat = hentSplittedePerioder(periode, vilkårsperioder, splittDato);

                expect(resultat).toEqual([]);
            });

            test('vilkårsperioder er tom array', () => {
                const periode = {
                    fom: '2026-06-01',
                    tom: '2026-07-31',
                } satisfies Periode;
                const splittDato = new Date('2026-07-01');

                const resultat = hentSplittedePerioder(periode, [], splittDato);

                expect(resultat).toEqual([]);
            });
        });
    });
});
