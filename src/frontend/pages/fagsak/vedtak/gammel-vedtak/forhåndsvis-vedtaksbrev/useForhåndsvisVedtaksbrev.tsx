import { useState } from 'react';

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
    const tomRessurs = byggTomRessurs<string>();
    const [hentetForhåndsvisning, setHentetForhåndsvisning] = useState<Ressurs<string>>(tomRessurs);
    const [visModal, setVisModal] = useState(false);
    const { hentBrevdata, validerAlleAvsnittOk } = useVedtak();
    const { forhåndsvisVedtaksbrev } = useDokumentApi();

    const nullstillHentetForhåndsvisning = (): void => {
        setHentetForhåndsvisning(byggTomRessurs);
        setVisModal(false);
    };

    const kanViseForhåndsvisning = (): void => {
        if (validerAlleAvsnittOk(false)) {
            setVisModal(true);
        }
    };

    const hentVedtaksbrev = (): void => {
        setHentetForhåndsvisning(byggHenterRessurs());
        const payload = hentBrevdata();
        forhåndsvisVedtaksbrev(payload).then((response: Ressurs<string>) => {
            setVisModal(true);
            if (response.status === RessursStatus.Suksess) {
                const blob = new Blob([base64ToArrayBuffer(response.data)], {
                    type: 'application/pdf',
                });
                setHentetForhåndsvisning(byggDataRessurs(window.URL.createObjectURL(blob)));
            } else if (
                response.status === RessursStatus.Feilet ||
                response.status === RessursStatus.FunksjonellFeil ||
                response.status === RessursStatus.IkkeTilgang
            ) {
                setHentetForhåndsvisning(response);
            } else {
                setHentetForhåndsvisning(
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
