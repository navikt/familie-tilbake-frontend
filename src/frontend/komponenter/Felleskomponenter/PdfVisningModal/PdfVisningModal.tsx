import type { RessursByte } from '../../../generated';

import { Modal, Loader, Heading, Alert } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

import { type Ressurs, RessursStatus } from '../../../typer/ressurs';
import { handlePdfData } from '../../../utils/pdfUtils';

const StyledModal = styled(Modal)`
    height: 100%;

    div.aksel-modal__body {
        height: 100%;
        margin-right: 24px;
        overflow: hidden;
    }

    button.aksel-modal__button {
        right: 4px;
        top: 12px;
        padding: 4px;
    }
`;

const IframePdfVisning = styled.iframe`
    margin: 0 auto;
    height: 100%;
    width: 100%;
`;

type Props = {
    onRequestClose: () => void;
    pdfdata: Ressurs<string> | RessursByte;
    åpen: boolean;
};

const PdfVisningModal: React.FC<Props> = ({ onRequestClose, pdfdata, åpen }) => {
    return (
        <StyledModal
            open={åpen}
            onClose={onRequestClose}
            className="pdfvisning-modal"
            header={{ heading: '', closeButton: true }}
            width="100rem"
        >
            <Modal.Body>
                <Dokument pdfdata={pdfdata} />
            </Modal.Body>
        </StyledModal>
    );
};

const Dokument: React.FC<{ pdfdata: Ressurs<string> | RessursByte }> = ({ pdfdata }) => {
    switch (pdfdata.status) {
        case RessursStatus.Henter:
            return (
                <div className="pdfvisning-modal__spinner">
                    <Heading spacing size="small" level="2">
                        Innhenter dokument
                    </Heading>
                    <Loader
                        size="2xlarge"
                        title="venter..."
                        transparent={false}
                        variant="neutral"
                        className="pdfvisning-modal__spinner--item"
                    />
                </div>
            );
        case RessursStatus.Suksess: {
            // backend skal aldri svare med null som data for kall som har status suksess
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const pdfSrc = handlePdfData(pdfdata.data!);
            return <IframePdfVisning title="Dokument" src={pdfSrc} allow="fullscreen" />;
        }
        case RessursStatus.Feilet:
        case RessursStatus.FunksjonellFeil:
        case RessursStatus.IkkeTilgang:
            return (
                <Alert variant="error" className="pdfvisning-modal__document--feil">
                    {pdfdata.frontendFeilmelding}
                </Alert>
            );
        default:
            return <Alert variant="warning">Kunne ikke hente dokument</Alert>;
    }
};

export default PdfVisningModal;
