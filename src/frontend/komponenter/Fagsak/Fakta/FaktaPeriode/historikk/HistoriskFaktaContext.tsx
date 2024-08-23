import { useEffect, useState } from 'react';

import { AxiosError } from 'axios';
import createUseContext from 'constate';

import {
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    type Ressurs,
} from '@navikt/familie-typer';

import { useBehandlingApi } from '../../../../../api/behandling';
import { IBehandling } from '../../../../../typer/behandling';
import { IFeilutbetalingFakta } from '../../../../../typer/feilutbetalingtyper';
import { sorterFeilutbetaltePerioder } from '../../../../../utils';
import { FaktaPeriodeSkjemaData, FaktaSkjemaData } from '../../typer/feilutbetalingFakta';

interface IProps {
    behandling: IBehandling;
}

const [HistoriskFaktaProvider, useHistoriskFakta] = createUseContext(({ behandling }: IProps) => {
    const [feilutbetalingInaktiveFakta, settFeilutbetalingInaktiveFakta] =
        useState<Ressurs<IFeilutbetalingFakta[]>>(byggTomRessurs);

    const [skjemaData, settSkjemaData] = useState<FaktaSkjemaData>();
    const [fakta, settFakta] = useState<IFeilutbetalingFakta>();

    useEffect(() => {
        hentFeilutbetalingFakta();
    }, [behandling]);

    const settFeilutbetalingInaktivFakta = (feilutbetalingInaktivFakta?: IFeilutbetalingFakta) => {
        if (feilutbetalingInaktivFakta) {
            const sortertePerioder = sorterFeilutbetaltePerioder(
                feilutbetalingInaktivFakta.feilutbetaltePerioder
            );
            const behandletPerioder = sortertePerioder.map((fuFP, index) => {
                const behandletPeriode: FaktaPeriodeSkjemaData = {
                    index,
                    feilutbetaltBeløp: fuFP.feilutbetaltBeløp,
                    periode: fuFP.periode,
                    hendelsestype: fuFP.hendelsestype || undefined,
                    hendelsesundertype: fuFP.hendelsesundertype || undefined,
                };
                return behandletPeriode;
            });

            const data: FaktaSkjemaData = {
                begrunnelse: feilutbetalingInaktivFakta.begrunnelse || undefined,
                perioder: behandletPerioder,
                vurderingAvBrukersUttalelse: feilutbetalingInaktivFakta.vurderingAvBrukersUttalelse,
            };
            settSkjemaData(data);
            settFakta(feilutbetalingInaktivFakta);
        }
    };

    const { gjerFeilutbetalingInaktiveFaktaKall } = useBehandlingApi();

    const hentFeilutbetalingFakta = (): void => {
        settFeilutbetalingInaktiveFakta(byggHenterRessurs());
        gjerFeilutbetalingInaktiveFaktaKall(behandling.behandlingId)
            .then((respons: Ressurs<IFeilutbetalingFakta[]>) => {
                settFeilutbetalingInaktiveFakta(respons);
            })
            .catch((_error: AxiosError) => {
                settFeilutbetalingInaktiveFakta(
                    byggFeiletRessurs(
                        'Ukjent feil ved henting av inaktive fakta-perioder for behandling'
                    )
                );
            });
    };

    return {
        feilutbetalingInaktiveFakta,
        settFeilutbetalingInaktivFakta,
        skjemaData,
        fakta,
    };
});

export { HistoriskFaktaProvider, useHistoriskFakta };
