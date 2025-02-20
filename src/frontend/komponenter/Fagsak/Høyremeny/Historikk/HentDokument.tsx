import * as React from 'react';

import { useHistorikk } from './HistorikkContext';
import { IHistorikkInnslag } from '../../../../typer/historikk';
import { base64ToArrayBuffer } from '../../../../utils';
import PdfVisningModal from '../../../Felleskomponenter/PdfVisningModal/PdfVisningModal';
import {
    byggDataRessurs,
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    type Ressurs,
    RessursStatus,
} from '../../../../typer/ressurs';
import { useHttp } from '../../../../api/http/HttpProvider';

interface IProps {
    innslag: IHistorikkInnslag;
    onClose: () => void;
}

const HentDokument: React.FC<IProps> = ({ innslag, onClose }) => {
    const [hentetDokument, settHentetDokument] = React.useState<Ressurs<string>>(byggTomRessurs());
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const { behandling } = useHistorikk();
    const { request } = useHttp();

    React.useEffect(() => {
        settVisModal(true);
        settHentetDokument(byggHenterRessurs());
        request<void, string>({
            method: 'GET',
            url: `/familie-tilbake/api/behandling/${behandling.behandlingId}/journalpost/${innslag.journalpostId}/dokument/${innslag.dokumentId}`,
        }).then((response: Ressurs<string>) => {
            if (response.status === RessursStatus.SUKSESS) {
                const blob = new Blob([base64ToArrayBuffer(response.data)], {
                    type: 'application/pdf',
                });
                settHentetDokument(byggDataRessurs(window.URL.createObjectURL(blob)));
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [behandling, innslag]);

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
