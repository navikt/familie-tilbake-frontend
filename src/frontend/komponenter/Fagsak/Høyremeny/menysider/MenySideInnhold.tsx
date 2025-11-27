import type { Behandling } from '../../../../typer/behandling';
import type { Fagsak } from '../../../../typer/fagsak';

import * as React from 'react';

import { Brevmottakere } from './brevmottakere/Brevmottakere';
import { Dokumentlisting } from './dokumenter/Dokumentlisting';
import { DokumentlistingProvider } from './dokumenter/DokumentlistingContext';
import Historikk from './historikk/Historikk';
import { HistorikkProvider } from './historikk/HistorikkContext';
import SendMelding from './sendMelding/SendMelding';
import { SendMeldingProvider } from './sendMelding/SendMeldingContext';
import Totrinnskontroll from './totrinnskontroll/Totrinnskontroll';
import { TotrinnskontrollProvider } from './totrinnskontroll/TotrinnskontrollContext';

export enum Menysider {
    Totrinn = `TOTRINN`,
    Historikk = 'HISTORIKK',
    SendBrev = 'SEND_BREV',
    Dokumenter = 'DOKUMENTER',
    Brevmottakere = 'BREVMOTTAKERE',
}

type Props = {
    valgtMenyside: Menysider;
    fagsak: Fagsak;
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
        case Menysider.Brevmottakere:
            return <Brevmottakere />;
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
