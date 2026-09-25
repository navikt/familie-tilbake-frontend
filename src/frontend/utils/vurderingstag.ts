import type { TagProps } from '@navikt/ds-react';
import type { BeregningsresultatVurdering } from '@/generated-new';
import type { Vurderingsstatus } from '@/pages/fagsak/vilkaarsvurdering/typer';

export type PeriodeTag = {
    label: string;
    'data-color': TagProps['data-color'];
};

export const vurderingsmapper: Record<BeregningsresultatVurdering, Vurderingsstatus> = {
    Forsett: 'FORSETT',
    GrovUaktsomhet: 'GROVT_UAKTSOMHET',
    Uaktsomhet: 'UAKTSOMT',
    GodTro: 'GOD_TRO',
    Forstod: 'FORSTO',
    BurdeForstått: 'BURDE_FORSTÅTT',
    //TODO fikses når foreldet er håndtert i vilkårsvurdering
    Foreldet: 'IKKE_VURDERT',
};

export const vurderingstag: Record<Vurderingsstatus, PeriodeTag> = {
    IKKE_VURDERT: {
        label: 'Ikke vurdert',
        'data-color': 'neutral',
    },
    GOD_TRO: { label: 'God tro', 'data-color': 'success' },
    FORSETT: {
        label: 'Forsett',
        'data-color': 'brand-magenta',
    },
    GROVT_UAKTSOMHET: {
        label: 'Grovt uaktsomt',
        'data-color': 'warning',
    },
    UAKTSOMT: {
        label: 'Uaktsomt',
        'data-color': 'meta-purple',
    },
    FORSTO: { label: 'Forsto', 'data-color': 'meta-lime' },
    BURDE_FORSTÅTT: {
        label: 'Burde forstått',
        'data-color': 'brand-beige',
    },
};
