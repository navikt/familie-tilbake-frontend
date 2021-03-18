import React from 'react';

import createUseContext from 'constate';

import {
    Aktsomhetsvurdering,
    VilkårsresultatInfo,
    VilkårsvurderingPeriode,
} from '../typer/feilutbetalingtyper';

interface IContextProps {
    periode: VilkårsvurderingPeriode;
}

const [VilkårsvurderingPeriodeProvider, useVilkårsvurderingPeriode] = createUseContext(
    ({ periode }: IContextProps) => {
        const [
            vilkårsvurderingPeriode,
            settVilkårsvurderingPeriode,
        ] = React.useState<VilkårsvurderingPeriode>();
        const [vilkårsresultat, settVilkårsresultat] = React.useState<VilkårsresultatInfo>();
        const [
            aktsomhetsvurdering,
            settAktsomhetsvurdering,
        ] = React.useState<Aktsomhetsvurdering>();

        React.useEffect(() => {
            settVilkårsvurderingPeriode(periode);

            if (periode.vilkårsresultat) {
                settVilkårsresultat(periode.vilkårsresultat);
            } else {
                settVilkårsresultat(undefined);
            }

            if (periode.vilkårsresultat?.aktsomhetsvurdering) {
                settAktsomhetsvurdering(periode.vilkårsresultat.aktsomhetsvurdering);
            } else {
                settAktsomhetsvurdering(undefined);
            }
        }, [periode]);

        const oppdaterVilkårsresultat = (data: VilkårsresultatInfo) => {
            // TODO: Logikk for å "nullstille" aktsomhetsvurdering her?
            settVilkårsresultat({ ...vilkårsresultat, ...data });
        };

        const oppdaterAktsomhetsvurdering = (data: Aktsomhetsvurdering) => {
            // TODO: Logikk for å "nullstille" andre deler av aktsomhetsvurdering her?
            // Eksempel: aktsomhet: FORSETT -> SIMPELT_UAKTSOMHET o.s.b.
            settAktsomhetsvurdering({ ...aktsomhetsvurdering, ...data });
        };

        return {
            vilkårsvurderingPeriode,
            vilkårsresultat,
            oppdaterVilkårsresultat,
            aktsomhetsvurdering,
            oppdaterAktsomhetsvurdering,
        };
    }
);

export { VilkårsvurderingPeriodeProvider, useVilkårsvurderingPeriode };
