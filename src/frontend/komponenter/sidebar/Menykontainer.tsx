import * as React from 'react';

import { Dokumentlisting } from './dokumentlisting/Dokumentlisting';
import { DokumentlistingProvider } from './dokumentlisting/DokumentlistingContext';
import { Historikk } from './historikk/Historikk';
import { HistorikkProvider } from './historikk/HistorikkContext';
import { SendMelding } from './sendMelding/SendMelding';
import { SendMeldingProvider } from './sendMelding/SendMeldingContext';
import { Totrinnskontroll } from './totrinnskontroll/Totrinnskontroll';
import { TotrinnskontrollProvider } from './totrinnskontroll/TotrinnskontrollContext';

export enum Menysider {
    Totrinn = `TOTRINN`,
    Historikk = 'HISTORIKK',
    SendBrev = 'SEND_BREV',
    Dokumenter = 'DOKUMENTER',
}

type Props = {
    valgtMenyside: Menysider;
};

export const MenySideInnhold: React.FC<Props> = ({ valgtMenyside }) => {
    switch (valgtMenyside) {
        case Menysider.Totrinn:
            return (
                <TotrinnskontrollProvider>
                    <Totrinnskontroll />
                </TotrinnskontrollProvider>
            );
        case Menysider.Dokumenter:
            return (
                <DokumentlistingProvider valgtMenyside={valgtMenyside}>
                    <Dokumentlisting />
                </DokumentlistingProvider>
            );
        case Menysider.SendBrev:
            return (
                <SendMeldingProvider>
                    <SendMelding />
                </SendMeldingProvider>
            );
        case Menysider.Historikk:
        default:
            return (
                <HistorikkProvider valgtMenyside={valgtMenyside}>
                    <Historikk />
                </HistorikkProvider>
            );
    }
};
