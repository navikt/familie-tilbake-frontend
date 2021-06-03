import * as React from 'react';

import { useHttp } from '@navikt/familie-http';
import {
    byggDataRessurs,
    byggFeiletRessurs,
    byggTomRessurs,
    Ressurs,
    RessursStatus,
} from '@navikt/familie-typer';

import { IHistorikkInnslag } from '../../../../typer/historikk';
import PdfVisningModal from '../../../Felleskomponenter/PdfVisningModal/PdfVisningModal';
import { useHistorikk } from './HistorikkContext';

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
        request<void, string>({
            method: 'GET',
            url: `/familie-tilbake/api/behandling/${behandling.behandlingId}/journalpost/${innslag.journalpostId}/dokument/${innslag.dokumentId}`,
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
