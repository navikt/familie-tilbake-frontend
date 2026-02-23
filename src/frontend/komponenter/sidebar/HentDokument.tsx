import * as React from 'react';

import { useHttp } from '~/api/http/HttpProvider';
import { useBehandling } from '~/context/BehandlingContext';
import { PdfVisningModal } from '~/komponenter/pdf-visning-modal/PdfVisningModal';
import {
    byggDataRessurs,
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    type Ressurs,
    RessursStatus,
} from '~/typer/ressurs';
import { base64ToArrayBuffer } from '~/utils';

type Props = {
    journalpostId: string | undefined;
    dokumentId: string | undefined;
    onClose: () => void;
};

export const HentDokument: React.FC<Props> = ({ journalpostId, dokumentId, onClose }) => {
    const [hentetDokument, settHentetDokument] = React.useState<Ressurs<string>>(byggTomRessurs());
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const { behandlingId } = useBehandling();
    const { request } = useHttp();

    React.useEffect(() => {
        settVisModal(true);
        settHentetDokument(byggHenterRessurs());
        request<void, string>({
            method: 'GET',
            url: `/familie-tilbake/api/behandling/${behandlingId}/journalpost/${journalpostId}/dokument/${dokumentId}`,
        }).then((response: Ressurs<string>) => {
            if (response.status === RessursStatus.Suksess) {
                const blob = new Blob([base64ToArrayBuffer(response.data)], {
                    type: 'application/pdf',
                });
                settHentetDokument(byggDataRessurs(window.URL.createObjectURL(blob)));
            } else if (
                response.status === RessursStatus.Feilet ||
                response.status === RessursStatus.FunksjonellFeil ||
                response.status === RessursStatus.IkkeTilgang
            ) {
                settHentetDokument(response);
            } else {
                settHentetDokument(
                    byggFeiletRessurs('Ukjent feil, kunne ikke generere forhåndsvisning.')
                );
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [behandlingId, journalpostId, dokumentId]);

    return (
        <PdfVisningModal
            åpen={visModal}
            pdfdata={hentetDokument}
            onRequestClose={() => {
                settHentetDokument(byggTomRessurs);
                settVisModal(false);
                onClose();
            }}
        />
    );
};
