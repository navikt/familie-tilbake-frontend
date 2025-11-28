import type { RessursByte } from '../../../generated';
import type { FC, Ref } from 'react';

import { Modal, Loader, Heading, Alert } from '@navikt/ds-react';
import { ASpacing1, ASpacing3, ASpacing6 } from '@navikt/ds-tokens/dist/tokens';
import * as React from 'react';
import { useImperativeHandle, useState } from 'react';
import { styled } from 'styled-components';

import { type Ressurs, RessursStatus } from '../../../typer/ressurs';
import { handlePdfData } from '../../../utils/pdfUtils';

const StyledModal = styled(Modal)`
    height: 100%;

    div.aksel-modal__body {
        height: 100%;
        margin-right: ${ASpacing6};
        overflow: hidden;
    }

    button.aksel-modal__button {
        right: ${ASpacing1};
        top: ${ASpacing3};
        padding: ${ASpacing1};
    }
`;

const IframePdfVisning = styled.iframe`
    margin: 0 auto;
    height: 100%;
    width: 100%;
`;

export type PdfVisningModalHandle = {
    showModal: (data: Ressurs<string> | RessursByte) => void;
};

type Props = {
    ref?: Ref<PdfVisningModalHandle>;
    åpen?: boolean;
    pdfdata?: Ressurs<string> | RessursByte;
    onRequestClose?: () => void;
};

const PdfVisningModal: FC<Props> = ({ ref, åpen, pdfdata: propsPdfdata, onRequestClose }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [pdfdata, setPdfdata] = useState<Ressurs<string> | RessursByte>();

    useImperativeHandle(ref, () => ({
        showModal: (data: Ressurs<string> | RessursByte): void => {
            setPdfdata(data);
            setIsOpen(true);
        },
    }));

    const handleClose = (): void => {
        setIsOpen(false);
        setPdfdata(undefined);
        onRequestClose?.();
    };

    const modalIsOpen = åpen ?? isOpen;
    const modalPdfdata = propsPdfdata ?? pdfdata;

    if (!modalIsOpen || !modalPdfdata) return null;

    return (
        <StyledModal
            open={modalIsOpen}
            onClose={handleClose}
            className="pdfvisning-modal"
            header={{ heading: '', closeButton: true }}
            width="100rem"
        >
            <Modal.Body>
                <Dokument pdfdata={modalPdfdata} />
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
            const pdfSrc = handlePdfData(pdfdata.data);
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
