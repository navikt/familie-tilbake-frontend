import type { Periode } from '@/generated';

import { format } from 'date-fns';

/**
 * Returnerer de to periodene som dannes ved å splitte en periode på en gitt dato.
 * Splittdatoen må være fom-datoen for en av vilkårsperiodene innenfor perioden.
 *
 * @param delbarePerioder Alle de delbare periodene i perioden det skal splittes på
 * @param splittDato Datoen å splitte på (må være Date objekt, ikke string)
 * @returns Array med to perioder [før, etter] eller tom array hvis splitting ikke er mulig
 */
export const hentSplittedePerioder = (
    delbarePerioder: Periode[],
    splittDato: Date | undefined
): Periode[] => {
    if (!splittDato || delbarePerioder.length < 2) {
        return [];
    }

    const splittDatoString = format(splittDato, 'yyyy-MM-dd');

    const delbarePerioderFør = delbarePerioder.filter(({ tom }) => tom < splittDatoString);
    const delbarePerioderEtter = delbarePerioder.filter(({ fom }) => fom >= splittDatoString);

    if (delbarePerioderFør.length === 0 || delbarePerioderEtter.length === 0) {
        return [];
    }

    const førPeriode = {
        fom: delbarePerioderFør[0].fom,
        tom: delbarePerioderFør[delbarePerioderFør.length - 1].tom,
    } satisfies Periode;

    const etterPeriode = {
        fom: delbarePerioderEtter[0].fom,
        tom: delbarePerioderEtter[delbarePerioderEtter.length - 1].tom,
    } satisfies Periode;

    return [førPeriode, etterPeriode];
};
