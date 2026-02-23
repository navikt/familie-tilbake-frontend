import type { RessursByte } from '~/generated';

import { Modal, Loader, Heading, Alert } from '@navikt/ds-react';
import * as React from 'react';

import { type Ressurs, RessursStatus } from '~/typer/ressurs';
import { handlePdfData } from '~/utils/pdfUtils';

type Props = {
    onRequestClose: () => void;
    pdfdata: Ressurs<string> | RessursByte;
    åpen: boolean;
};

export const PdfVisningModal: React.FC<Props> = ({ onRequestClose, pdfdata, åpen }) => {
    return (
        <Modal
            open={åpen}
            onClose={onRequestClose}
            className="h-full"
            header={{ heading: '', closeButton: true }}
            width="100rem"
        >
            <Dokument pdfdata={pdfdata} />
        </Modal>
    );
};

const Dokument: React.FC<{ pdfdata: Ressurs<string> | RessursByte }> = ({ pdfdata }) => {
    switch (pdfdata.status) {
        case RessursStatus.Henter:
            return (
                <div className="flex flex-col gap-6 items-center justify-center">
                    <Heading size="small" level="2">
                        Innhenter dokument
                    </Heading>
                    <Loader
                        size="2xlarge"
                        title="venter..."
                        transparent={false}
                        variant="neutral"
                    />
                </div>
            );
        case RessursStatus.Suksess: {
            // backend skal aldri svare med null som data for kall som har status suksess
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const pdfSrc = handlePdfData(pdfdata.data!);
            return (
                <iframe
                    className="h-full w-full"
                    title="Dokument"
                    src={pdfSrc}
                    allow="fullscreen"
                />
            );
        }
        case RessursStatus.Feilet:
        case RessursStatus.FunksjonellFeil:
        case RessursStatus.IkkeTilgang:
            return <Alert variant="error">{pdfdata.frontendFeilmelding}</Alert>;
        default:
            return <Alert variant="error">Kunne ikke hente dokument</Alert>;
    }
};
