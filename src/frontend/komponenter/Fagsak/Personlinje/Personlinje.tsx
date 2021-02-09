import * as React from 'react';

import KnappBase from 'nav-frontend-knapper';

import { RessursStatus } from '@navikt/familie-typer';
import Visittkort from '@navikt/familie-visittkort';

import { useBehandling } from '../../../context/BehandlingContext';
import { IFagsak } from '../../../typer/fagsak';
import { IPerson } from '../../../typer/person';
import Behandlingsmeny from './Behandlingsmeny/Behandlingsmeny';

interface IProps {
    bruker: IPerson;
    fagsak: IFagsak;
}

const Personlinje: React.FC<IProps> = ({ bruker, fagsak }) => {
    const { åpenBehandling } = useBehandling();
    return (
        <Visittkort
            navn={bruker.navn}
            ident={fagsak.søkerFødselsnummer}
            kjønn={bruker.kjønn}
            alder={bruker.alder}
        >
            <div style={{ flex: 1 }}></div>

            {åpenBehandling?.status === RessursStatus.SUKSESS && (
                <KnappBase mini={true} type={'flat'}>
                    Gå til revurderingen
                </KnappBase>
            )}

            <KnappBase mini={true} type={'flat'}>
                Gå til saksoversikt
            </KnappBase>

            <Behandlingsmeny fagsak={fagsak} />
        </Visittkort>
    );
};

export default Personlinje;
