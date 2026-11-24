import type { FC } from 'react';

import { useBehandling } from '@/context/BehandlingContext';

import { Detaljer } from './detaljer/Detaljer';
import { Dokumentlisting } from './dokumentlisting/Dokumentlisting';
import { DokumentlistingProvider } from './dokumentlisting/DokumentlistingContext';
import { Historikk as GammelHistorikk } from './gammel-historikk/Historikk';
import { HistorikkProvider } from './gammel-historikk/HistorikkContext';
import { Historikk } from './historikk/Historikk';
import { Menysider } from './menysider';
import { SendMelding } from './sendMelding/SendMelding';
import { SendMeldingProvider } from './sendMelding/SendMeldingContext';
import { Totrinnskontroll } from './totrinnskontroll/Totrinnskontroll';
import { TotrinnskontrollProvider } from './totrinnskontroll/TotrinnskontrollContext';

type Props = {
    valgtMenyside: Menysider;
};

export const SidebarInnhold: FC<Props> = ({ valgtMenyside }: Props) => {
    const { erNyModell } = useBehandling();
    switch (valgtMenyside) {
        case Menysider.Totrinn:
            return (
                <TotrinnskontrollProvider>
                    <Totrinnskontroll />
                </TotrinnskontrollProvider>
            );
        case Menysider.Dokumenter:
            return (
                <DokumentlistingProvider>
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
            if (erNyModell) {
                return <Historikk />;
            }
            return (
                <HistorikkProvider>
                    <GammelHistorikk />
                </HistorikkProvider>
            );
        case Menysider.Detaljer:
        default:
            return <Detaljer />;
    }
};
