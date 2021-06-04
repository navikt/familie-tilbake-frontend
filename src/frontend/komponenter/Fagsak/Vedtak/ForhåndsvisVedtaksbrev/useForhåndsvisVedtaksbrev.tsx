import * as React from 'react';

import { useHttp } from '@navikt/familie-http';
import {
    byggDataRessurs,
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    Ressurs,
    RessursStatus,
} from '@navikt/familie-typer';

import { useFeilutbetalingVedtak } from '../FeilutbetalingVedtakContext';
import { ForhåndsvisVedtaksbrev } from '../typer/feilutbetalingVedtak';

const useForhåndsvisVedtaksbrev = () => {
    const [hentetForhåndsvisning, settHentetForhåndsvisning] = React.useState<Ressurs<string>>(
        byggTomRessurs()
    );
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const { hentBrevdata } = useFeilutbetalingVedtak();
    const { request } = useHttp();

    const nullstillHentetForhåndsvisning = () => {
        settHentetForhåndsvisning(byggTomRessurs);
    };

    const hentVedtaksbrev = () => {
        settHentetForhåndsvisning(byggHenterRessurs());
        const payload = hentBrevdata();
        request<ForhåndsvisVedtaksbrev, string>({
            method: 'POST',
            url: '/familie-tilbake/api/dokument/forhandsvis-vedtaksbrev',
            data: payload,
        }).then((response: Ressurs<string>) => {
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
        });
    };

    return {
        visModal,
        settVisModal,
        hentetForhåndsvisning,
        hentVedtaksbrev,
        nullstillHentetForhåndsvisning,
    };
};

export { useForhåndsvisVedtaksbrev };
