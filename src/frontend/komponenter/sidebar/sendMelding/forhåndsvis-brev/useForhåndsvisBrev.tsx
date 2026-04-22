import type { Dispatch, SetStateAction } from 'react';

import { useState } from 'react';

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
    setVisModal: Dispatch<SetStateAction<boolean>>;
    hentetForhåndsvisning: Ressurs<string>;
    hentBrev: () => void;
    nullstillHentetForhåndsvisning: () => void;
};

const useForhåndsvisBrev = (): ForhåndsvisBrevHook => {
    const tomRessurs = byggTomRessurs<string>();
    const [hentetForhåndsvisning, setHentetForhåndsvisning] = useState<Ressurs<string>>(tomRessurs);
    const [visModal, setVisModal] = useState(false);
    const { hentBrevdata } = useSendMelding();
    const { forhåndsvisBrev } = useDokumentApi();

    const nullstillHentetForhåndsvisning = (): void => {
        setHentetForhåndsvisning(byggTomRessurs);
    };

    const hentBrev = (): void => {
        setHentetForhåndsvisning(byggHenterRessurs());
        const payload = hentBrevdata();
        forhåndsvisBrev(payload).then((response: Ressurs<string>) => {
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
        setVisModal,
        hentetForhåndsvisning,
        hentBrev,
        nullstillHentetForhåndsvisning,
    };
};

export { useForhåndsvisBrev };
