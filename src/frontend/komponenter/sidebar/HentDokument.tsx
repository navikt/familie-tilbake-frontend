import type { FC } from 'react';

import { useEffect, useState } from 'react';

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

export const HentDokument: FC<Props> = ({ journalpostId, dokumentId, onClose }) => {
    const [hentetDokument, setHentetDokument] = useState<Ressurs<string>>(() =>
        byggHenterRessurs()
    );
    const [visModal, setVisModal] = useState(true);
    const { behandlingId } = useBehandling();
    const { request } = useHttp();

    useEffect(() => {
        request<void, string>({
            method: 'GET',
            url: `/familie-tilbake/api/behandling/${behandlingId}/journalpost/${journalpostId}/dokument/${dokumentId}`,
        }).then((response: Ressurs<string>) => {
            if (response.status === RessursStatus.Suksess) {
                const blob = new Blob([base64ToArrayBuffer(response.data)], {
                    type: 'application/pdf',
                });
                setHentetDokument(byggDataRessurs(window.URL.createObjectURL(blob)));
            } else if (
                response.status === RessursStatus.Feilet ||
                response.status === RessursStatus.FunksjonellFeil ||
                response.status === RessursStatus.IkkeTilgang
            ) {
                setHentetDokument(response);
            } else {
                setHentetDokument(
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
                setHentetDokument(byggTomRessurs());
                setVisModal(false);
                onClose();
            }}
        />
    );
};
