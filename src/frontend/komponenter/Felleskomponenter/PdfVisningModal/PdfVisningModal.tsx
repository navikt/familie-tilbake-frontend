import * as React from 'react';

import styled from 'styled-components';

import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import Modal from 'nav-frontend-modal';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Undertittel } from 'nav-frontend-typografi';

import { Ressurs, RessursStatus } from '@navikt/familie-typer';

const StyledModal = styled(Modal)`
    width: 50rem;
    height: 80%;

    section {
        height: 100%;
        margin-right: 1.1rem;
    }

    button {
        margin-right: -0.7rem;
        width: 1.5rem;
        height: 1.5rem;
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
            className={'pdfvisning-modal'}
            isOpen={åpen}
            onRequestClose={onRequestClose}
            contentLabel={'pdfvisning'}
        >
            <Dokument pdfdata={pdfdata} />
        </StyledModal>
    );
};

const Dokument: React.FC<{ pdfdata: Ressurs<string> }> = ({ pdfdata }) => {
    switch (pdfdata.status) {
        case RessursStatus.HENTER:
            return (
                <div className={'pdfvisning-modal__spinner'}>
                    <Undertittel children={'Innhenter dokument'} />
                    <NavFrontendSpinner className={'pdfvisning-modal__spinner--item'} />
                </div>
            );
        case RessursStatus.SUKSESS:
            return <IframePdfVisning title={'Dokument'} src={pdfdata.data} />;
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
        case RessursStatus.IKKE_TILGANG:
            return (
                <AlertStripeFeil
                    className={'pdfvisning-modal__document--feil'}
                    children={pdfdata.frontendFeilmelding}
                />
            );
        default:
            return null;
    }
};

export default PdfVisningModal;
