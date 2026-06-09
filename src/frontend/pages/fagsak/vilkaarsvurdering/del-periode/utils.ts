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
    if (!splittDato) {
        return [];
    }

    const splittDatoString = formatDate(splittDato, 'yyyy-MM-dd');

    const vilkårsperioderInnenfor = vilkårsperioder.filter(
        ({ fom, tom }) => fom >= periode.fom && tom <= periode.tom
    );

    const periodeFørSplittDato = vilkårsperioderInnenfor.findLast(
        ({ tom }) => tom <= splittDatoString
    );

    const periodeEtterSplittDato = vilkårsperioderInnenfor.find(
        ({ fom }) => fom >= splittDatoString
    );

    if (!periodeFørSplittDato || !periodeEtterSplittDato) {
        return [];
    }

    return [periodeFørSplittDato, periodeEtterSplittDato];
};
