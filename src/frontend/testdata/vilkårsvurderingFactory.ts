import type { VilkårsvurderingPeriodeSkjemaData } from '../komponenter/Fagsak/Vilkårsvurdering/typer/vilkårsvurdering';

import { HendelseType } from '../kodeverk';

export const lagVilkårsvurderingsperiode = (
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
