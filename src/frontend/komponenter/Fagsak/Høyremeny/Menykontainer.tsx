import * as React from 'react';

import { Dokumentlisting } from './Dokumentlisting/Dokumentlisting';
import { DokumentlistingProvider } from './Dokumentlisting/DokumentlistingContext';
import Historikk from './Historikk/Historikk';
import { HistorikkProvider } from './Historikk/HistorikkContext';
import SendMelding from './SendMelding/SendMelding';
import { SendMeldingProvider } from './SendMelding/SendMeldingContext';
import Totrinnskontroll from './Totrinnskontroll/Totrinnskontroll';
import { TotrinnskontrollProvider } from './Totrinnskontroll/TotrinnskontrollContext';

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
