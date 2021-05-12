import * as React from 'react';

import { IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import Dokumentlisting from './Dokumentlisting/Dokumentlisting';
import Historikk from './Historikk/Historikk';
import SendMelding from './SendMelding/SendMelding';
import Totrinnskontroll from './Totrinnskontroll/Totrinnskontroll';
import { TotrinnskontrollProvider } from './Totrinnskontroll/TotrinnskontrollContext';

export enum Menysider {
    TOTRINN,
    HISTORIKK,
    SEND_BREV,
    DOKUMENTER,
}

interface IProps {
    valgtMenyside: Menysider;
    fagsak: IFagsak;
    behandling: IBehandling;
}

const Undermeny: React.FC<IProps> = ({ valgtMenyside, fagsak, behandling }) => {
    switch (valgtMenyside) {
        case Menysider.TOTRINN:
            return (
                <TotrinnskontrollProvider fagsak={fagsak} behandling={behandling}>
                    <Totrinnskontroll fagsak={fagsak} behandling={behandling} />
                </TotrinnskontrollProvider>
            );
        case Menysider.DOKUMENTER:
            return <Dokumentlisting />;
        case Menysider.SEND_BREV:
            return <SendMelding />;
        case Menysider.HISTORIKK:
        default:
            return <Historikk />;
    }
};

export default Undermeny;
