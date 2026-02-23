import * as React from 'react';

import { useDokumentApi } from '~/api/dokument';
import { useSendMelding } from '~/komponenter/sidebar/sendMelding/SendMeldingContext';
import {
    byggDataRessurs,
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    type Ressurs,
    RessursStatus,
} from '~/typer/ressurs';
import { base64ToArrayBuffer } from '~/utils';

type ForhåndsvisBrevHook = {
    visModal: boolean;
    settVisModal: React.Dispatch<React.SetStateAction<boolean>>;
    hentetForhåndsvisning: Ressurs<string>;
    hentBrev: () => void;
    nullstillHentetForhåndsvisning: () => void;
};

const useForhåndsvisBrev = (): ForhåndsvisBrevHook => {
    const [hentetForhåndsvisning, settHentetForhåndsvisning] =
        React.useState<Ressurs<string>>(byggTomRessurs());
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const { hentBrevdata } = useSendMelding();
    const { forhåndsvisBrev } = useDokumentApi();

    const nullstillHentetForhåndsvisning = (): void => {
        settHentetForhåndsvisning(byggTomRessurs);
    };

    const hentBrev = (): void => {
        settHentetForhåndsvisning(byggHenterRessurs());
        const payload = hentBrevdata();
        forhåndsvisBrev(payload).then((response: Ressurs<string>) => {
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
        settVisModal,
        hentetForhåndsvisning,
        hentBrev,
        nullstillHentetForhåndsvisning,
    };
};

export { useForhåndsvisBrev };
