import type { IBehandling } from '../../../../typer/behandling';
import type { VilkårsvurderingResponse } from '../../../../typer/tilbakekrevingstyper';
import type { VilkårsvurderingPeriodeSkjemaData } from '../typer/vilkårsvurdering';

import createUseContext from 'constate';
import { useEffect, useState } from 'react';

import { useBehandlingApi } from '../../../../api/behandling';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    type Ressurs,
} from '../../../../typer/ressurs';
import { sorterFeilutbetaltePerioder } from '../../../../utils';

interface IProps {
    behandling: IBehandling;
}

const [HistoriskVilkårsvurderingProvider, useHistoriskVilkårsvurdering] = createUseContext(
    ({ behandling }: IProps) => {
        const [inaktiveVilkårsvurderinger, setInaktiveVilkårsvurderinger] =
            useState<Ressurs<VilkårsvurderingResponse[]>>(byggTomRessurs);

        const [skjemaData, settSkjemaData] = useState<VilkårsvurderingPeriodeSkjemaData[]>([]);

        useEffect(() => {
            hentVilkårsvurdering();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [behandling]);

        const setInaktivVilkårsvurdering = (
            inaktivVilkårsvurdering?: VilkårsvurderingResponse
        ): void => {
            if (inaktivVilkårsvurdering) {
                const perioder = inaktivVilkårsvurdering.perioder;
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

        const { gjerInaktiveVilkårsvurderingerKall } = useBehandlingApi();

        const hentVilkårsvurdering = (): void => {
            setInaktiveVilkårsvurderinger(byggHenterRessurs());
            gjerInaktiveVilkårsvurderingerKall(behandling.behandlingId)
                .then((respons: Ressurs<VilkårsvurderingResponse[]>) => {
                    setInaktiveVilkårsvurderinger(respons);
                })
                .catch(() => {
                    setInaktiveVilkårsvurderinger(
                        byggFeiletRessurs(
                            'Ukjent feil ved henting av vilkårsvurdering-perioder for behandling'
                        )
                    );
                });
        };

        return {
            inaktiveVilkårsvurderinger,
            setInaktivVilkårsvurdering,
            skjemaData,
        };
    }
);

export { HistoriskVilkårsvurderingProvider, useHistoriskVilkårsvurdering };
