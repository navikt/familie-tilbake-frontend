import * as React from 'react';

import {
    byggDataRessurs,
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    Ressurs,
    RessursStatus,
} from '@navikt/familie-typer';

import { useDokumentApi } from '../../../../../api/dokument';
import { base64ToArrayBuffer } from '../../../../../utils';
import { useSendMelding } from '../SendMeldingContext';

const useForhåndsvisBrev = () => {
    const [hentetForhåndsvisning, settHentetForhåndsvisning] = React.useState<Ressurs<string>>(
        byggTomRessurs()
    );
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const { hentBrevdata } = useSendMelding();
    const { forhåndsvisBrev } = useDokumentApi();

    const nullstillHentetForhåndsvisning = () => {
        settHentetForhåndsvisning(byggTomRessurs);
    };

    const hentBrev = () => {
        settHentetForhåndsvisning(byggHenterRessurs());
        const payload = hentBrevdata();
        forhåndsvisBrev(payload).then((response: Ressurs<string>) => {
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
        settVisModal,
        hentetForhåndsvisning,
        hentBrev,
        nullstillHentetForhåndsvisning,
    };
};

export { useForhåndsvisBrev };
