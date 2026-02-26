import * as React from 'react';

import { useDokumentApi } from '~/api/dokument';
import { useVedtak } from '~/pages/fagsak/vedtak/gammel-vedtak/VedtakContext';
import {
    byggDataRessurs,
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    type Ressurs,
    RessursStatus,
} from '~/typer/ressurs';
import { base64ToArrayBuffer } from '~/utils';

type ForhåndsvisVedtaksbrevHook = {
    visModal: boolean;
    kanViseForhåndsvisning: () => void;
    hentetForhåndsvisning: Ressurs<string>;
    hentVedtaksbrev: () => void;
    nullstillHentetForhåndsvisning: () => void;
};

const useForhåndsvisVedtaksbrev = (): ForhåndsvisVedtaksbrevHook => {
    const [hentetForhåndsvisning, settHentetForhåndsvisning] =
        React.useState<Ressurs<string>>(byggTomRessurs());
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const { hentBrevdata, validerAlleAvsnittOk } = useVedtak();
    const { forhåndsvisVedtaksbrev } = useDokumentApi();

    const nullstillHentetForhåndsvisning = (): void => {
        settHentetForhåndsvisning(byggTomRessurs);
        settVisModal(false);
    };

    const kanViseForhåndsvisning = (): void => {
        if (validerAlleAvsnittOk(false)) {
            settVisModal(true);
        }
    };

    const hentVedtaksbrev = (): void => {
        settHentetForhåndsvisning(byggHenterRessurs());
        const payload = hentBrevdata();
        forhåndsvisVedtaksbrev(payload).then((response: Ressurs<string>) => {
            settVisModal(true);
            if (response.status === RessursStatus.Suksess) {
                const blob = new Blob([base64ToArrayBuffer(response.data)], {
                    type: 'application/pdf',
                });
                settHentetForhåndsvisning(byggDataRessurs(window.URL.createObjectURL(blob)));
            } else if (
                response.status === RessursStatus.Feilet ||
                response.status === RessursStatus.FunksjonellFeil ||
                response.status === RessursStatus.IkkeTilgang
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
