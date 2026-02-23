import type { HenleggelseSkjemaDefinisjon } from '~/komponenter/meny/henlegg/henleggModal/HenleggModalContext';

import * as React from 'react';

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
    settVisModal: React.Dispatch<React.SetStateAction<boolean>>;
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
    const [hentetForhåndsvisning, settHentetForhåndsvisning] =
        React.useState<Ressurs<string>>(byggTomRessurs());
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const { forhåndsvisHenleggelsesbrev } = useDokumentApi();

    const nullstillHentetForhåndsvisning = (): void => {
        settHentetForhåndsvisning(byggTomRessurs);
    };

    const hentBrev = (): void => {
        settHentetForhåndsvisning(byggHenterRessurs());

        forhåndsvisHenleggelsesbrev({
            behandlingId: behandlingId,
            fritekst: skjema.felter.fritekst.verdi,
        })
            .then((response: Ressurs<string>) => {
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
            })
            .catch(() => {
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
