import type { IBehandling } from '../../../../../typer/behandling';
import type { FaktaResponse } from '../../../../../typer/tilbakekrevingstyper';
import type { FaktaPeriodeSkjemaData, FaktaSkjemaData } from '../../typer/fakta';
import type { AxiosError } from 'axios';

import createUseContext from 'constate';
import { useEffect, useState } from 'react';

import { useBehandlingApi } from '../../../../../api/behandling';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    type Ressurs,
} from '../../../../../typer/ressurs';
import { sorterFeilutbetaltePerioder } from '../../../../../utils';

interface IProps {
    behandling: IBehandling;
}

const [HistoriskFaktaProvider, useHistoriskFakta] = createUseContext(({ behandling }: IProps) => {
    const [inaktiveFakta, setInaktiveFakta] = useState<Ressurs<FaktaResponse[]>>(byggTomRessurs);

    const [skjemaData, settSkjemaData] = useState<FaktaSkjemaData>();
    const [fakta, settFakta] = useState<FaktaResponse>();

    useEffect(() => {
        hentFakta();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [behandling]);

    const setInaktivFakta = (inaktivFakta?: FaktaResponse): void => {
        if (inaktivFakta) {
            const sortertePerioder = sorterFeilutbetaltePerioder(
                inaktivFakta.feilutbetaltePerioder
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
                begrunnelse: inaktivFakta.begrunnelse || undefined,
                perioder: behandletPerioder,
                vurderingAvBrukersUttalelse: inaktivFakta.vurderingAvBrukersUttalelse,
            };
            settSkjemaData(data);
            settFakta(inaktivFakta);
        }
    };

    const { gjerInaktiveFaktaKall } = useBehandlingApi();

    const hentFakta = (): void => {
        setInaktiveFakta(byggHenterRessurs());
        gjerInaktiveFaktaKall(behandling.behandlingId)
            .then((respons: Ressurs<FaktaResponse[]>) => {
                setInaktiveFakta(respons);
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .catch((_error: AxiosError) => {
                setInaktiveFakta(
                    byggFeiletRessurs(
                        'Ukjent feil ved henting av inaktive fakta-perioder for behandling'
                    )
                );
            });
    };

    return {
        inaktiveFakta,
        setInaktivFakta,
        skjemaData,
        fakta,
    };
});

export { HistoriskFaktaProvider, useHistoriskFakta };
