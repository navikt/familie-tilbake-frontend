import type { TagProps } from '@navikt/ds-react';
import type { ReactNode } from 'react';
import type { _0Enum as VedtaksresultatEnum } from '@/generated-new';

export type Vurderingsstatus =
    | 'IKKE_VURDERT'
    | 'GOD_TRO'
    | 'FORSETT'
    | 'GROVT_UAKTSOMHET'
    | 'UAKTSOMT'
    | 'FORSTO'
    | 'BURDE_FORSTÅTT';

export type PeriodeTag = {
    label: string;
    icon: ReactNode;
    'data-color': TagProps['data-color'];
};

export type Vilkårsperiode = {
    id: string;
    fom: string;
    tom: string;
    feilutbetalt: number;
    vurdering: Vurderingsstatus;
    resultat: VedtaksresultatEnum | null;
    rettsligGrunnlag: string[];
};
