import * as React from 'react';

import { AxiosError } from 'axios';

import { useHttp } from '@navikt/familie-http';
import { ISkjema } from '@navikt/familie-skjema';
import {
    byggDataRessurs,
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    Ressurs,
    RessursStatus,
} from '@navikt/familie-typer';

import { IBehandling } from '../../../../../../typer/behandling';
import { HenleggelseSkjemaDefinisjon } from '../HenleggBehandlingModal/HenleggBehandlingModalContext';

interface ForhåndsvisHenleggelsesbrevPayload {
    behandlingId: string;
    fritekst: string;
}

interface IProps {
    skjema: ISkjema<HenleggelseSkjemaDefinisjon, string>;
}

export const useForhåndsvisHenleggelsesbrev = ({ skjema }: IProps) => {
    const [hentetForhåndsvisning, settHentetForhåndsvisning] = React.useState<Ressurs<string>>(
        byggTomRessurs()
    );
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const { request } = useHttp();

    const nullstillHentetForhåndsvisning = () => {
        settHentetForhåndsvisning(byggTomRessurs);
    };

    const hentBrev = (behandling: IBehandling) => {
        settHentetForhåndsvisning(byggHenterRessurs());

        request<ForhåndsvisHenleggelsesbrevPayload, string>({
            method: 'POST',
            url: '/familie-tilbake/api/dokument/forhandsvis-henleggelsesbrev',
            data: {
                behandlingId: behandling.behandlingId,
                fritekst: skjema.felter.fritekst.verdi,
            },
        })
            .then((response: Ressurs<string>) => {
                settVisModal(true);
                if (response.status === RessursStatus.SUKSESS) {
                    settHentetForhåndsvisning(
                        byggDataRessurs(`data:application/pdf;base64,${response.data}`)
                    );
                } else if (
                    response.status === RessursStatus.FEILET ||
                    response.status === RessursStatus.FUNKSJONELL_FEIL ||
                    response.status === RessursStatus.IKKE_TILGANG
                ) {
                    settHentetForhåndsvisning(response);
                } else {
                    settHentetForhåndsvisning(
                        byggFeiletRessurs('Ukjent feil, kunne ikke generere forhåndsvisning.')
                    );
                }
            })
            .catch((_error: AxiosError) => {
                settHentetForhåndsvisning(
                    byggFeiletRessurs('Ukjent feil, kunne ikke generere forhåndsvisning.')
                );
            });
    };

    return {
        visModal,
        settVisModal,
        hentetForhåndsvisning,
        hentBrev,
        nullstillHentetForhåndsvisning,
    };
};
