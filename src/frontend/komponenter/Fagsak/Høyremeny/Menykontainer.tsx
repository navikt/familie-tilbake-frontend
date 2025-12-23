import type { FagsakDto } from '../../../generated';
import type { Behandling } from '../../../typer/behandling';

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
    fagsak: FagsakDto;
    behandling: Behandling;
};

export const MenySideInnhold: React.FC<Props> = ({ valgtMenyside, fagsak, behandling }) => {
    switch (valgtMenyside) {
        case Menysider.Totrinn:
            return (
                <TotrinnskontrollProvider fagsak={fagsak} behandling={behandling}>
                    <Totrinnskontroll />
                </TotrinnskontrollProvider>
            );
        case Menysider.Dokumenter:
            return (
                <DokumentlistingProvider behandling={behandling} valgtMenyside={valgtMenyside}>
                    <Dokumentlisting />
                </DokumentlistingProvider>
            );
        case Menysider.SendBrev:
            return (
                <SendMeldingProvider behandling={behandling} fagsak={fagsak}>
                    <SendMelding fagsak={fagsak} behandling={behandling} />
                </SendMeldingProvider>
            );
        case Menysider.Historikk:
        default:
            return (
                <HistorikkProvider
                    fagsak={fagsak}
                    behandling={behandling}
                    valgtMenyside={valgtMenyside}
                >
                    <Historikk />
                </HistorikkProvider>
            );
    }
};
