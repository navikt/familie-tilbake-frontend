import * as React from 'react';

import { AxiosError } from 'axios';
import createUseContext from 'constate';

import {
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    type Ressurs,
} from '@navikt/familie-typer';

import { useBehandlingApi } from '../../../../api/behandling';
import { IBehandling } from '../../../../typer/behandling';
import { IFeilutbetalingVilkårsvurdering } from '../../../../typer/feilutbetalingtyper';
import { sorterFeilutbetaltePerioder } from '../../../../utils';
import { VilkårsvurderingPeriodeSkjemaData } from '../typer/feilutbetalingVilkårsvurdering';

interface IProps {
    behandling: IBehandling;
}

const [HistoriskVilkårsvurderingProvider, useHistoriskVilkårsvurdering] = createUseContext(
    ({ behandling }: IProps) => {
        const [
            feilutbetalingInaktiveVilkårsvurderinger,
            settFeilutbetalingInaktiveVilkårsvurderinger,
        ] = React.useState<Ressurs<IFeilutbetalingVilkårsvurdering[]>>(byggTomRessurs);

        const [skjemaData, settSkjemaData] = React.useState<VilkårsvurderingPeriodeSkjemaData[]>(
            []
        );

        React.useEffect(() => {
            hentFeilutbetalingVilkårsvurdering();
        }, [behandling]);

        const settFeilutbetalingInaktivVilkårsvurdering = (
            feilutbetalingInaktivVilkårsvurdering?: IFeilutbetalingVilkårsvurdering
        ) => {
            if (feilutbetalingInaktivVilkårsvurdering) {
                const perioder = feilutbetalingInaktivVilkårsvurdering.perioder;
                const sortertePerioder = sorterFeilutbetaltePerioder(perioder);
                const skjemaPerioder = sortertePerioder.map((fuFP, index) => {
                    const skjemaPeriode: VilkårsvurderingPeriodeSkjemaData = {
                        index: `idx_fpsd_inaktiv_${index}`,
                        ...fuFP,
                    };
                    return skjemaPeriode;
                });

                settSkjemaData(skjemaPerioder);
            }
        };

        const { gjerFeilutbetalingInaktiveVilkårsvurderingerKall } = useBehandlingApi();

        const hentFeilutbetalingVilkårsvurdering = (): void => {
            settFeilutbetalingInaktiveVilkårsvurderinger(byggHenterRessurs());
            gjerFeilutbetalingInaktiveVilkårsvurderingerKall(behandling.behandlingId)
                .then((respons: Ressurs<IFeilutbetalingVilkårsvurdering[]>) => {
                    settFeilutbetalingInaktiveVilkårsvurderinger(respons);
                })
                .catch((error: AxiosError) => {
                    console.log('Error ved henting av vilkårsvurdering: ', error);
                    settFeilutbetalingInaktiveVilkårsvurderinger(
                        byggFeiletRessurs(
                            'Ukjent feil ved henting av vilkårsvurdering-perioder for behandling'
                        )
                    );
                });
        };

        return {
            feilutbetalingInaktiveVilkårsvurderinger,
            settFeilutbetalingInaktivVilkårsvurdering,
            skjemaData,
        };
    }
);

export { HistoriskVilkårsvurderingProvider, useHistoriskVilkårsvurdering };
