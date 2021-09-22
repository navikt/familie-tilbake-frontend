import * as React from 'react';

import { useHttp } from '@navikt/familie-http';
import {
    byggDataRessurs,
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    IDokumentInfo,
    IJournalpost,
    Ressurs,
    RessursStatus,
} from '@navikt/familie-typer';

import PdfVisningModal from '../../../Felleskomponenter/PdfVisningModal/PdfVisningModal';
import { useDokumentlisting } from './DokumentlistingContext';

interface IProps {
    journalpost: IJournalpost;
    dokument: IDokumentInfo;
    onClose: () => void;
}

const HentDokument: React.FC<IProps> = ({ journalpost, dokument, onClose }) => {
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
            if (response.status === RessursStatus.SUKSESS) {
                settHentetDokument(byggDataRessurs(`data:application/pdf;base64,${response.data}`));
            } else if (
                response.status === RessursStatus.FEILET ||
                response.status === RessursStatus.FUNKSJONELL_FEIL ||
                response.status === RessursStatus.IKKE_TILGANG
            ) {
                settHentetDokument(response);
            } else {
                settHentetDokument(
                    byggFeiletRessurs('Ukjent feil, kunne ikke generere forhåndsvisning.')
                );
            }
        });
    }, [behandling, journalpost, dokument]);

    const nullstillHentetDokument = () => {
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
