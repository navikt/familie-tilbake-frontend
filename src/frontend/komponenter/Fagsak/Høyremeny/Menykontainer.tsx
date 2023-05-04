import * as React from 'react';

import { IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import Dokumentlisting from './Dokumentlisting/Dokumentlisting';
import { DokumentlistingProvider } from './Dokumentlisting/DokumentlistingContext';
import Historikk from './Historikk/Historikk';
import { HistorikkProvider } from './Historikk/HistorikkContext';
import SendMelding from './SendMelding/SendMelding';
import { SendMeldingProvider } from './SendMelding/SendMeldingContext';
import Totrinnskontroll from './Totrinnskontroll/Totrinnskontroll';
import { TotrinnskontrollProvider } from './Totrinnskontroll/TotrinnskontrollContext';

export enum Menysider {
    TOTRINN = `TOTRINN`,
    HISTORIKK = 'HISTORIKK',
    SEND_BREV = 'SEND_BREV',
    DOKUMENTER = 'DOKUMENTER',
}

interface IProps {
    valgtMenyside: Menysider;
    fagsak: IFagsak;
    behandling: IBehandling;
}

const Menykontainer: React.FC<IProps> = ({ valgtMenyside, fagsak, behandling }) => {
    switch (valgtMenyside) {
        case Menysider.TOTRINN:
            return (
                <TotrinnskontrollProvider fagsak={fagsak} behandling={behandling}>
                    <Totrinnskontroll />
                </TotrinnskontrollProvider>
            );
        case Menysider.DOKUMENTER:
            return (
                <DokumentlistingProvider behandling={behandling} valgtMenyside={valgtMenyside}>
                    <Dokumentlisting />
                </DokumentlistingProvider>
            );
        case Menysider.SEND_BREV:
            return (
                <SendMeldingProvider behandling={behandling}>
                    <SendMelding fagsak={fagsak} behandling={behandling} />
                </SendMeldingProvider>
            );
        case Menysider.HISTORIKK:
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

export default Menykontainer;
