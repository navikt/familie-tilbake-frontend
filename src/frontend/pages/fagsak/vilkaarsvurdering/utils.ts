import type { Periode } from '@/generated';

/**
 *
 * @param periode Dette er perioden man skal sjekke om man kan splitte på hvis flere perioder i vilkårsperioder er inne i periode
 * @param vilkårsperioder Dette er alle periodene for hele behandlingen
 * @returns true hvis man kan splitte periode
 */
export const kanSplitte = (periode: Periode, vilkårsperioder: Periode[]): boolean => {
    if (vilkårsperioder.length === 0) {
        return false;
    }

    const periodeFom = new Date(periode.fom);
    const periodeTom = new Date(periode.tom);

    const antallPerioderInnenfor = vilkårsperioder.filter(vilkårsperiode => {
        const vilkårsperiodeFom = new Date(vilkårsperiode.fom);
        const vilkårsperiodeTom = new Date(vilkårsperiode.tom);
        return vilkårsperiodeFom >= periodeFom && vilkårsperiodeTom <= periodeTom;
    }).length;

    return antallPerioderInnenfor >= 2;
};
