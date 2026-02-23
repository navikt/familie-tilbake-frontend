import type { VilkårsvurderingPeriodeSkjemaData } from '~/pages/fagsak/vilkaarsvurdering/typer/vilkårsvurdering';
import type {
    VilkårsvurderingPeriode,
    VilkårsvurderingResponse,
} from '~/typer/tilbakekrevingstyper';

import { HendelseType } from '~/kodeverk';

export const lagVilkårsvurderingPeriodeSkjemaData = (
    overrides?: Partial<VilkårsvurderingPeriodeSkjemaData>
): VilkårsvurderingPeriodeSkjemaData => ({
    index: '0',
    feilutbetaltBeløp: 0,
    periode: {
        fom: '2021-01-01',
        tom: '2021-04-30',
    },
    hendelsestype: HendelseType.Annet,
    foreldet: false,
    ...overrides,
});

export const lagVilkårsvurderingPeriode = (
    overrides?: Partial<VilkårsvurderingPeriode>
): VilkårsvurderingPeriode => {
    return {
        feilutbetaltBeløp: 0,
        periode: {
            fom: '2021-01-01',
            tom: '2021-04-30',
        },
        hendelsestype: HendelseType.Annet,
        foreldet: false,
        begrunnelse: '',
        aktiviteter: [],
        ...overrides,
    };
};

export const lagVilkårsvurderingResponse = (
    overrides?: Partial<VilkårsvurderingResponse>
): VilkårsvurderingResponse => {
    return {
        perioder: [lagVilkårsvurderingPeriode()],
        rettsgebyr: 1199,
        opprettetTid: new Date().toISOString(),
        ...overrides,
    };
};
