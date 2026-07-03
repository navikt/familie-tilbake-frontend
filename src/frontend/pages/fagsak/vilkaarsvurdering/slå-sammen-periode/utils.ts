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

const eldsteDelbarePeriode = (periode: SammenslåbarPeriode): PeriodeInfo | undefined =>
    [...periode.delbarePerioder].sort(sorterPåFom)[0];

const nyesteDelbarePeriode = (periode: SammenslåbarPeriode): PeriodeInfo | undefined =>
    [...periode.delbarePerioder].sort(sorterPåFom).at(-1);

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
 *          perioden er den eldste (og dermed ikke har en tidligere periode å slå sammen fra),
 *          eller hvis en av periodene mangler delbare perioder å koble sammen.
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
    const eldsteDelbareAvGjeldende = eldsteDelbarePeriode(gjeldendePeriode);
    const nyesteDelbareAvForrige = nyesteDelbarePeriode(forrigePeriode);
    if (!eldsteDelbareAvGjeldende || !nyesteDelbareAvForrige) {
        return undefined;
    }
    return {
        forrigePeriode,
        sammenslaaing: {
            vilkårsvurderingId: eldsteDelbareAvGjeldende.periodeId,
            slåesSammenMedId: nyesteDelbareAvForrige.periodeId,
        },
    };
};
