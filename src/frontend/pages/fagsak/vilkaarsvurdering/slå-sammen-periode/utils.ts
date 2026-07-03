import type { Periode, PeriodeInfo, Sammenslaaing } from '@/generated-new';

export type SammenslåbarPeriode = {
    periodeId: string;
    periode: Periode;
    delbarePerioder: PeriodeInfo[];
};

export type Sammenslåingsforslag = {
    forrigePeriode: SammenslåbarPeriode;
    sammenslaaing: Sammenslaaing;
};

const sorterPåFom = <T extends { periode: Periode }>(a: T, b: T): number =>
    a.periode.fom.localeCompare(b.periode.fom);

const eldsteDelbarePeriode = (periode: SammenslåbarPeriode): PeriodeInfo => {
    const sortert = [...periode.delbarePerioder].sort(sorterPåFom);
    return sortert[0] ?? { periodeId: periode.periodeId, periode: periode.periode };
};

const nyesteDelbarePeriode = (periode: SammenslåbarPeriode): PeriodeInfo => {
    const sortert = [...periode.delbarePerioder].sort(sorterPåFom);
    return (
        sortert[sortert.length - 1] ?? { periodeId: periode.periodeId, periode: periode.periode }
    );
};

/**
 * Finner forslag for å slå sammen den gjeldende (nyeste av to naboer) perioden med den
 * forrige (eldre) perioden.
 *
 * Sammenslåing skjer fra den nyeste perioden, og kobler de to delbare periodene som
 * ligger inntil hverandre på tvers av periodegrensen:
 * - `vilkårsvurderingId`: den eldste delbare perioden på den gjeldende (nyeste) perioden
 * - `slåesSammenMedId`: den nyeste delbare perioden på den forrige (eldste) perioden
 *
 * @returns forslag med forrige periode og request-body, eller undefined hvis den gjeldende
 *          perioden er den eldste (og dermed ikke har en tidligere periode å slå sammen fra).
 */
export const finnSammenslåingsforslag = (
    vilkårsperioder: SammenslåbarPeriode[],
    vilkårsvurderingId: string
): Sammenslåingsforslag | undefined => {
    const sortertePerioder = [...vilkårsperioder].sort(sorterPåFom);
    const gjeldendeIndeks = sortertePerioder.findIndex(
        ({ periodeId }) => periodeId === vilkårsvurderingId
    );
    if (gjeldendeIndeks <= 0) {
        return undefined;
    }
    const gjeldendePeriode = sortertePerioder[gjeldendeIndeks];
    const forrigePeriode = sortertePerioder[gjeldendeIndeks - 1];
    return {
        forrigePeriode,
        sammenslaaing: {
            vilkårsvurderingId: eldsteDelbarePeriode(gjeldendePeriode).periodeId,
            slåesSammenMedId: nyesteDelbarePeriode(forrigePeriode).periodeId,
        },
    };
};
