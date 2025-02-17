import * as React from 'react';

import {
    byggDataRessurs,
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
} from '@navikt/familie-typer';

import { useDokumentApi } from '../../../../api/dokument';
import { base64ToArrayBuffer } from '../../../../utils';
import { useFeilutbetalingVedtak } from '../FeilutbetalingVedtakContext';
import { type Ressurs, RessursStatus } from '../../../../typer/ressurs';

const useForhåndsvisVedtaksbrev = () => {
    const [hentetForhåndsvisning, settHentetForhåndsvisning] =
        React.useState<Ressurs<string>>(byggTomRessurs());
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const { hentBrevdata, validerAlleAvsnittOk } = useFeilutbetalingVedtak();
    const { forhåndsvisVedtaksbrev } = useDokumentApi();

    const nullstillHentetForhåndsvisning = () => {
        settHentetForhåndsvisning(byggTomRessurs);
        settVisModal(false);
    };

    const kanViseForhåndsvisning = () => {
        if (validerAlleAvsnittOk(false)) {
            settVisModal(true);
        }
    };

    const hentVedtaksbrev = () => {
        settHentetForhåndsvisning(byggHenterRessurs());
        const payload = hentBrevdata();
        forhåndsvisVedtaksbrev(payload).then((response: Ressurs<string>) => {
            settVisModal(true);
            if (response.status === RessursStatus.SUKSESS) {
                const blob = new Blob([base64ToArrayBuffer(response.data)], {
                    type: 'application/pdf',
                });
                settHentetForhåndsvisning(byggDataRessurs(window.URL.createObjectURL(blob)));
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
        kanViseForhåndsvisning,
        hentetForhåndsvisning,
        hentVedtaksbrev,
        nullstillHentetForhåndsvisning,
    };
};

export { useForhåndsvisVedtaksbrev };
