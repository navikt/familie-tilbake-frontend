import type { Periode } from '@/generated';

import { formatDate } from 'date-fns/format';

/**
 * Sjekker om en periode kan splittes basert på antall vilkårsperioder innenfor.
 * Krever minst 2 vilkårsperioder som ligger helt innenfor perioden.
 * Sammenligner datostrenger direkte (ISO-format) for optimal ytelse.
 *
 * @param periode Perioden som skal splittes
 * @param vilkårsperioder Alle vilkårsperiodene for hele behandlingen
 * @returns true hvis periode kan splittes (2+ vilkårsperioder innenfor)
 */
export const kanSplitte = (periode: Periode, vilkårsperioder: Periode[]): boolean => {
    if (vilkårsperioder.length < 2) return false;

    const periodeFom = periode.fom;
    const periodeTom = periode.tom;

    const antallPerioderInnenfor = vilkårsperioder.filter(
        vilkårsperiode => vilkårsperiode.fom >= periodeFom && vilkårsperiode.tom <= periodeTom
    ).length;

    return antallPerioderInnenfor >= 2;
};

/**
 * Returnerer de to periodene som dannes ved å splitte en periode på en gitt dato.
 * Splittdatoen må være fom-datoen for en av vilkårsperiodene innenfor periode.
 *
 * @param periode Perioden som skal splittes
 * @param vilkårsperioder Alle vilkårsperiodene i en behandling
 * @param splittDato Datoen å splitte på (må være Date objekt, ikke string)
 * @returns Array med to perioder [før, etter] eller tom array hvis splitting ikke er mulig
 */
export const hentSplittedePerioder = (
    periode: Periode,
    vilkårsperioder: Periode[],
    splittDato: Date | undefined
): Periode[] => {
    if (!splittDato || vilkårsperioder.length < 2) {
        return [];
    }

    const splittDatoString = formatDate(splittDato, 'yyyy-MM-dd');

    const vilkårsperioderInnenfor = vilkårsperioder.filter(
        ({ fom, tom }) => fom >= periode.fom && tom <= periode.tom
    );

    const vilkårsperioderFør = vilkårsperioderInnenfor.filter(({ tom }) => tom < splittDatoString);

    const vilkårsperioderEtter = vilkårsperioderInnenfor.filter(
        ({ fom }) => fom >= splittDatoString
    );

    if (vilkårsperioderFør.length === 0 || vilkårsperioderEtter.length === 0) {
        return [];
    }

    const førPeriode = {
        fom: vilkårsperioderFør[0].fom,
        tom: vilkårsperioderFør[vilkårsperioderFør.length - 1].tom,
    } satisfies Periode;

    const etterPeriode = {
        fom: vilkårsperioderEtter[0].fom,
        tom: vilkårsperioderEtter[vilkårsperioderEtter.length - 1].tom,
    } satisfies Periode;

    return [førPeriode, etterPeriode];
};
