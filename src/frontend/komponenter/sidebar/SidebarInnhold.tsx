import type { FC } from 'react';

import { Detaljer } from './detaljer/Detaljer';
import { Dokumentlisting } from './dokumentlisting/Dokumentlisting';
import { DokumentlistingProvider } from './dokumentlisting/DokumentlistingContext';
import { Historikk } from './historikk/Historikk';
import { HistorikkProvider } from './historikk/HistorikkContext';
import { Menysider } from './menysider';
import { SendMelding } from './sendMelding/SendMelding';
import { SendMeldingProvider } from './sendMelding/SendMeldingContext';
import { Totrinnskontroll } from './totrinnskontroll/Totrinnskontroll';
import { TotrinnskontrollProvider } from './totrinnskontroll/TotrinnskontrollContext';

type Props = {
    valgtMenyside: Menysider;
};

export const SidebarInnhold: FC<Props> = ({ valgtMenyside }: Props) => {
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
            return (
                <HistorikkProvider valgtMenyside={valgtMenyside}>
                    <Historikk />
                </HistorikkProvider>
            );
        case Menysider.Detaljer:
        default:
            return <Detaljer />;
    }
};
