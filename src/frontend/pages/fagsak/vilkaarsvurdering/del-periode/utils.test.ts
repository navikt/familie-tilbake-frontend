import type { Periode } from '@/generated';

import { hentSplittedePerioder } from './utils';

describe('Vilkårsvurdering - utils', () => {
    describe('hentSplittedePerioder', () => {
        describe('returnerer splittede perioder når', () => {
            test('splittDato er gyldig', () => {
                const vilkårsperioder = [
                    { fom: '2026-06-01', tom: '2026-06-30' } satisfies Periode,
                    { fom: '2026-07-01', tom: '2026-07-31' } satisfies Periode,
                ];
                const splittDato = new Date('2026-07-01');

                const resultat = hentSplittedePerioder(vilkårsperioder, splittDato);

                expect(resultat).toHaveLength(2);
                expect(resultat[0]).toEqual(vilkårsperioder[0]);
                expect(resultat[1]).toEqual(vilkårsperioder[1]);
            });

            test('splittDato er fom av tredje periode', () => {
                const vilkårsperioder = [
                    { fom: '2026-06-01', tom: '2026-06-30' } satisfies Periode,
                    { fom: '2026-07-01', tom: '2026-07-31' } satisfies Periode,
                    { fom: '2026-08-01', tom: '2026-08-31' } satisfies Periode,
                ];
                const splittDato = new Date('2026-08-01');

                const resultat = hentSplittedePerioder(vilkårsperioder, splittDato);

                expect(resultat).toHaveLength(2);
                expect(resultat[0].tom).toBe('2026-07-31');
                expect(resultat[1].fom).toBe('2026-08-01');
            });

            test('splittDato på andre fom gir tredje periodes tom i andre resultatsperiode', () => {
                const vilkårsperioder = [
                    { fom: '2026-03-02', tom: '2026-03-13' } satisfies Periode,
                    { fom: '2026-05-04', tom: '2026-05-15' } satisfies Periode,
                    { fom: '2026-05-18', tom: '2026-05-29' } satisfies Periode,
                ];
                const splittDato = new Date('2026-05-04');

                const resultat = hentSplittedePerioder(vilkårsperioder, splittDato);

                expect(resultat).toHaveLength(2);
                expect(resultat[0].fom).toBe('2026-03-02');
                expect(resultat[0].tom).toBe('2026-03-13');
                expect(resultat[1].fom).toBe('2026-05-04');
                expect(resultat[1].tom).toBe('2026-05-29');
            });
        });

        describe('returnerer tom array når', () => {
            test('splittDato er undefined', () => {
                const vilkårsperioder = [
                    { fom: '2026-06-01', tom: '2026-06-30' } satisfies Periode,
                    { fom: '2026-07-01', tom: '2026-07-31' } satisfies Periode,
                ];

                const resultat = hentSplittedePerioder(vilkårsperioder, undefined);

                expect(resultat).toEqual([]);
            });

            test('splittDato ligger før noen vilkårsperiode', () => {
                const vilkårsperioder = [
                    { fom: '2026-06-15', tom: '2026-06-30' } satisfies Periode,
                    { fom: '2026-07-01', tom: '2026-07-31' } satisfies Periode,
                ];
                const splittDato = new Date('2026-06-01');

                const resultat = hentSplittedePerioder(vilkårsperioder, splittDato);

                expect(resultat).toEqual([]);
            });

            test('vilkårsperioder er tom array', () => {
                const vilkårsperioder: Periode[] = [];
                const splittDato = new Date('2026-07-01');

                const resultat = hentSplittedePerioder(vilkårsperioder, splittDato);

                expect(resultat).toEqual([]);
            });
        });
    });
});
