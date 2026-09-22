import type { ArsakTilTilbakeforing, DelresultatEnum } from '@/generated-new';

export type Vurderingsstatus =
    | 'IKKE_VURDERT'
    | 'GOD_TRO'
    | 'FORSETT'
    | 'GROVT_UAKTSOMHET'
    | 'UAKTSOMT'
    | 'FORSTO'
    | 'BURDE_FORSTÅTT';

export type Vilkårsperiode = {
    id: string;
    fom: string;
    tom: string;
    feilutbetalt: number;
    vurdering: Vurderingsstatus;
    resultat: DelresultatEnum;
    rettsligGrunnlag: string[];
    tilbakeført?: ArsakTilTilbakeforing;
};
