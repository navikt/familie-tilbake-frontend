import * as React from 'react';

import { styled } from 'styled-components';

import { Modal, Loader, Heading, Alert } from '@navikt/ds-react';
import { ASpacing1, ASpacing3, ASpacing6 } from '@navikt/ds-tokens/dist/tokens';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

const StyledModal = styled(Modal)`
    width: 90%;
    height: 90%;

    div.navds-modal__body {
        height: 100%;
        margin-right: ${ASpacing6};
        overflow: hidden;
    }

    button.navds-modal__button {
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

interface IProps {
    onRequestClose: () => void;
    pdfdata: Ressurs<string>;
    åpen: boolean;
}

const PdfVisningModal: React.FC<IProps> = ({ onRequestClose, pdfdata, åpen }) => {
    return (
        <StyledModal
            open={åpen}
            onClose={onRequestClose}
            className={'pdfvisning-modal'}
            header={{ heading: '', closeButton: true }}
            width={'100rem'}
        >
            <Modal.Body>
                <Dokument pdfdata={pdfdata} />
            </Modal.Body>
        </StyledModal>
    );
};

const Dokument: React.FC<{ pdfdata: Ressurs<string> }> = ({ pdfdata }) => {
    switch (pdfdata.status) {
        case RessursStatus.HENTER:
            return (
                <div className={'pdfvisning-modal__spinner'}>
                    <Heading spacing size="small" level="2" children={'Innhenter dokument'} />
                    <Loader
                        size="2xlarge"
                        title="venter..."
                        transparent={false}
                        variant="neutral"
                        className={'pdfvisning-modal__spinner--item'}
                    />
                </div>
            );
        case RessursStatus.SUKSESS:
            return <IframePdfVisning title={'Dokument'} src={pdfdata.data} />;
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
        case RessursStatus.IKKE_TILGANG:
            return (
                <Alert
                    variant="error"
                    className={'pdfvisning-modal__document--feil'}
                    children={pdfdata.frontendFeilmelding}
                />
            );
        default:
            <Alert variant="warning">Kunne ikke hente dokument</Alert>;
    }
};

export default PdfVisningModal;
