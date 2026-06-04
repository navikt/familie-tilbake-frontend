import type { FC } from 'react';
import type { RessursByte } from '@/generated';

import { Heading, Loader, LocalAlert, Modal } from '@navikt/ds-react';

import { type Ressurs, RessursStatus } from '@/typer/ressurs';
import { handlePdfData } from '@/utils/pdfUtils';

type Props = {
    onRequestClose: () => void;
    pdfdata: Ressurs<string> | RessursByte;
    åpen: boolean;
};

export const PdfVisningModal: FC<Props> = ({ onRequestClose, pdfdata, åpen }: Props) => {
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

type DokumentProps = {
    pdfdata: Ressurs<string> | RessursByte;
};

const Dokument: FC<DokumentProps> = ({ pdfdata }: DokumentProps) => {
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
            // biome-ignore lint/style/noNonNullAssertion: backend svarer aldri med null data ved suksess
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
            return (
                <LocalAlert status="error">
                    <LocalAlert.Header>
                        <LocalAlert.Title>Ingen tilgang</LocalAlert.Title>
                    </LocalAlert.Header>
                    <LocalAlert.Content>{pdfdata.frontendFeilmelding}</LocalAlert.Content>
                </LocalAlert>
            );
        default:
            return (
                <LocalAlert status="error">
                    <LocalAlert.Header>
                        <LocalAlert.Title>Kunne ikke hente dokument</LocalAlert.Title>
                    </LocalAlert.Header>
                </LocalAlert>
            );
    }
};
