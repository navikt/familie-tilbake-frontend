import type { HenleggelseSkjemaDefinisjon } from '~/komponenter/meny/henlegg/henleggModal/HenleggModalContext';

import { useState, type Dispatch, type SetStateAction } from 'react';

import { useDokumentApi } from '~/api/dokument';
import { useBehandling } from '~/context/BehandlingContext';
import { type Skjema } from '~/hooks/skjema';
import {
    byggDataRessurs,
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    type Ressurs,
    RessursStatus,
} from '~/typer/ressurs';
import { base64ToArrayBuffer } from '~/utils';

type ForhåndsvisHenleggelsesbrevHook = {
    visModal: boolean;
    setVisModal: Dispatch<SetStateAction<boolean>>;
    hentetForhåndsvisning: Ressurs<string>;
    hentBrev: () => void;
    nullstillHentetForhåndsvisning: () => void;
};

type Props = {
    skjema: Skjema<HenleggelseSkjemaDefinisjon, string>;
};

export const useForhåndsvisHenleggelsesbrev = ({
    skjema,
}: Props): ForhåndsvisHenleggelsesbrevHook => {
    const { behandlingId } = useBehandling();
    const tomRessurs = byggTomRessurs<string>();
    const [hentetForhåndsvisning, setHentetForhåndsvisning] = useState<Ressurs<string>>(tomRessurs);
    const [visModal, setVisModal] = useState(false);
    const { forhåndsvisHenleggelsesbrev } = useDokumentApi();

    const nullstillHentetForhåndsvisning = (): void => {
        setHentetForhåndsvisning(byggTomRessurs);
    };

    const hentBrev = (): void => {
        setHentetForhåndsvisning(byggHenterRessurs());

        forhåndsvisHenleggelsesbrev({
            behandlingId: behandlingId,
            fritekst: skjema.felter.fritekst.verdi,
        })
            .then((response: Ressurs<string>) => {
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
            })
            .catch(() => {
                setHentetForhåndsvisning(
                    byggFeiletRessurs('Ukjent feil, kunne ikke generere forhåndsvisning.')
                );
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
