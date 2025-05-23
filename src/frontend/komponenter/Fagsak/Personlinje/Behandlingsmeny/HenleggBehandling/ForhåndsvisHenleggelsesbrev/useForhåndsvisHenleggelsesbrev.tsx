import type { IBehandling } from '../../../../../../typer/behandling';
import type { HenleggelseSkjemaDefinisjon } from '../HenleggBehandlingModal/HenleggBehandlingModalContext';
import type { AxiosError } from 'axios';

import * as React from 'react';

import { useDokumentApi } from '../../../../../../api/dokument';
import { type ISkjema } from '../../../../../../hooks/skjema';
import {
    byggDataRessurs,
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    type Ressurs,
    RessursStatus,
} from '../../../../../../typer/ressurs';
import { base64ToArrayBuffer } from '../../../../../../utils';

interface IProps {
    skjema: ISkjema<HenleggelseSkjemaDefinisjon, string>;
}

export const useForhåndsvisHenleggelsesbrev = ({ skjema }: IProps) => {
    const [hentetForhåndsvisning, settHentetForhåndsvisning] =
        React.useState<Ressurs<string>>(byggTomRessurs());
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const { forhåndsvisHenleggelsesbrev } = useDokumentApi();

    const nullstillHentetForhåndsvisning = () => {
        settHentetForhåndsvisning(byggTomRessurs);
    };

    const hentBrev = (behandling: IBehandling) => {
        settHentetForhåndsvisning(byggHenterRessurs());

        forhåndsvisHenleggelsesbrev({
            behandlingId: behandling.behandlingId,
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
