import * as React from 'react';

import { AxiosError } from 'axios';

import { type ISkjema } from '@navikt/familie-skjema';
import {
    byggDataRessurs,
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
} from '@navikt/familie-typer';

import { useDokumentApi } from '../../../../../../api/dokument';
import { IBehandling } from '../../../../../../typer/behandling';
import { base64ToArrayBuffer } from '../../../../../../utils';
import { HenleggelseSkjemaDefinisjon } from '../HenleggBehandlingModal/HenleggBehandlingModalContext';
import { type Ressurs, RessursStatus } from '../../../../../../typer/ressurs';

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
