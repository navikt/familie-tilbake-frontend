import type { VilkaarsvurderingValg } from '@/generated-new';
import type { Vilkårsperiode, Vurderingsstatus } from './typer';

export const utledVurdering = (valg: VilkaarsvurderingValg): Vurderingsstatus => {
    switch (valg.vurdering) {
        case 'god_tro':
            return 'GOD_TRO';
        case 'forsto_eller_burde_forstått':
            return 'FORSTO';
        case 'forårsaket_av_mottaker':
            switch (valg.aktsomhet.aktsomhet) {
                case 'uaktsomt':
                    return 'UAKTSOMT';
                case 'grovtUaktsomt':
                    return 'GROVT_UAKTSOMHET';
                case 'forsettlig':
                    return 'FORSETT';
                default:
                    return 'IKKE_VURDERT';
            }
        case 'ikke_vurdert':
        default:
            return 'IKKE_VURDERT';
    }
};

export const erPeriodeVurdert = (periode: Vilkårsperiode): boolean =>
    periode.vurdering !== 'IKKE_VURDERT';

/**
 * Finner hvilken periode som skal være valgt som standard.
 * Perioder antas sortert med nyeste nederst (sist i listen).
 * - Velger den første (eldste i tid) uvurderte perioden, slik at saksbehandler
 *   ledes til neste periode som mangler vurdering.
 * - Hvis alle perioder er vurdert, velges den nyeste (nederste) perioden.
 */
export const finnStandardValgtPeriode = (
    perioder: Vilkårsperiode[]
): Vilkårsperiode | undefined => {
    if (perioder.length === 0) {
        return undefined;
    }
    const uvurderte = perioder.filter(periode => !erPeriodeVurdert(periode));
    if (uvurderte.length > 0) {
        return uvurderte[0];
    }
    return perioder[perioder.length - 1];
};
