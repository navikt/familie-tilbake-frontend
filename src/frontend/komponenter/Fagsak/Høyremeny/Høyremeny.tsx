import * as React from 'react';

import { useBehandling } from '../../../context/BehandlingContext';
import { IFagsak } from '../../../typer/fagsak';
import Behandlingskort from '../Behandlingskort/Behandlingskort';

interface IProps {
    fagsak: IFagsak;
}

const Høyremeny: React.FC<IProps> = ({ fagsak }) => {
    const { åpenBehandling } = useBehandling();
    return åpenBehandling ? (
        <div className={'høyremeny'}>
            <Behandlingskort fagsak={fagsak} åpenBehandling={åpenBehandling} />
        </div>
    ) : null;
};

export default Høyremeny;
