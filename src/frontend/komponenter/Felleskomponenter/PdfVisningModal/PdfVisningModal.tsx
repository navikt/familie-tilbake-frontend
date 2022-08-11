import * as React from 'react';

import styled from 'styled-components';

import { Modal, Loader, Heading, Alert } from '@navikt/ds-react';
import { NavdsSpacing1, NavdsSpacing3, NavdsSpacing6 } from '@navikt/ds-tokens/dist/tokens';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

const StyledModal = styled(Modal)`
    width: 90%;
    height: 90%;

    div.navds-modal__content {
        height: 100%;
        margin-right: ${NavdsSpacing6};
    }

    button.navds-modal__button {
        right: ${NavdsSpacing1};
        top: ${NavdsSpacing3};
        padding: ${NavdsSpacing1};
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
            shouldCloseOnOverlayClick={false}
            className={'pdfvisning-modal'}
        >
            <Modal.Content>
                <Dokument pdfdata={pdfdata} />
            </Modal.Content>
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
            return null;
    }
};

export default PdfVisningModal;
