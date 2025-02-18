import * as React from 'react';

import { AxiosError } from 'axios';
import createUseContext from 'constate';

import { useBehandlingApi } from '../../../../api/behandling';
import { IBehandling } from '../../../../typer/behandling';
import { IFeilutbetalingVilkårsvurdering } from '../../../../typer/feilutbetalingtyper';
import { sorterFeilutbetaltePerioder } from '../../../../utils';
import { VilkårsvurderingPeriodeSkjemaData } from '../typer/feilutbetalingVilkårsvurdering';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    type Ressurs,
} from '../../../../typer/ressurs';

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
            // eslint-disable-next-line react-hooks/exhaustive-deps
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
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .catch((_error: AxiosError) => {
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
