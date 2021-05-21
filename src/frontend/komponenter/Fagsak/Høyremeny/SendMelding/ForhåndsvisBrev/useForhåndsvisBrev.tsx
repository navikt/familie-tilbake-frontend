import * as React from 'react';

import { AxiosError } from 'axios';

import { useHttp } from '@navikt/familie-http';
import {
    byggDataRessurs,
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    Ressurs,
    RessursStatus,
} from '@navikt/familie-typer';

import { DokumentMal } from '../../../../../kodeverk';
import { useSendMelding } from '../SendMeldingContext';

export interface BrevPayload {
    behandlingId: string;
    brevmalkode: DokumentMal;
    fritekst: string;
}

const useForhåndsvisBrev = () => {
    const [hentetForhåndsvisning, settHentetForhåndsvisning] = React.useState<Ressurs<string>>(
        byggTomRessurs()
    );
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const { hentBrevdata } = useSendMelding();
    const { request } = useHttp();

    const nullstillHentetForhåndsvisning = () => {
        settHentetForhåndsvisning(byggTomRessurs);
    };

    const hentBrev = () => {
        settHentetForhåndsvisning(byggHenterRessurs());
        const payload = hentBrevdata();
        request<BrevPayload, string>({
            method: 'POST',
            url: '/familie-tilbake/api/dokument/forhandsvis',
            data: payload,
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

export { useForhåndsvisBrev };
