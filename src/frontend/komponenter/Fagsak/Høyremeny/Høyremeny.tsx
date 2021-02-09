import * as React from 'react';

import { IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import Behandlingskort from '../Behandlingskort/Behandlingskort';

interface IProps {
    fagsak: IFagsak;
    åpenBehandling: IBehandling;
}

const Høyremeny: React.FC<IProps> = ({ fagsak, åpenBehandling }) => {
    return (
        <div className={'høyremeny'}>
            <Behandlingskort fagsak={fagsak} åpenBehandling={åpenBehandling} />
        </div>
    );
};

export default Høyremeny;
