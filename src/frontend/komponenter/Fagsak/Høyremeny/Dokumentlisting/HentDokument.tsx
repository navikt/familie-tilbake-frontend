import type { DokumentInfo, Journalpost } from '../../../../typer/journalføring';

import * as React from 'react';

import { useDokumentlisting } from './DokumentlistingContext';
import { useHttp } from '../../../../api/http/HttpProvider';
import {
    byggDataRessurs,
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    type Ressurs,
    RessursStatus,
} from '../../../../typer/ressurs';
import { base64ToArrayBuffer } from '../../../../utils';
import PdfVisningModal from '../../../Felleskomponenter/PdfVisningModal/PdfVisningModal';

type Props = {
    journalpost: Journalpost;
    dokument: DokumentInfo;
    onClose: () => void;
};

const HentDokument: React.FC<Props> = ({ journalpost, dokument, onClose }) => {
    const [hentetDokument, settHentetDokument] = React.useState<Ressurs<string>>(byggTomRessurs());
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const { behandling } = useDokumentlisting();
    const { request } = useHttp();

    React.useEffect(() => {
        settVisModal(true);
        settHentetDokument(byggHenterRessurs());
        request<void, string>({
            method: 'GET',
            url: `/familie-tilbake/api/behandling/${behandling.behandlingId}/journalpost/${journalpost.journalpostId}/dokument/${dokument.dokumentInfoId}`,
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
    }, [behandling, journalpost, dokument]);

    const nullstillHentetDokument = (): void => {
        settHentetDokument(byggTomRessurs);
    };

    return (
        <>
            <PdfVisningModal
                åpen={visModal}
                pdfdata={hentetDokument}
                onRequestClose={() => {
                    nullstillHentetDokument();
                    settVisModal(false);
                    onClose();
                }}
            />
        </>
    );
};

export default HentDokument;
