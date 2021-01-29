import * as React from 'react';

import KnappBase from 'nav-frontend-knapper';

import Visittkort from '@navikt/familie-visittkort';

import { IFagsak } from '../../../typer/fagsak';
import { IPerson } from '../../../typer/person';
import Behandlingsmeny from './Behandlingsmeny/Behandlingsmeny';

interface IProps {
    bruker: IPerson;
    fagsak: IFagsak;
}

const Personlinje: React.FC<IProps> = ({ bruker, fagsak }) => {
    return (
        <Visittkort
            navn={bruker.navn}
            ident={fagsak.søkerFødselsnummer}
            kjønn={bruker.kjønn}
            alder={bruker.alder}
        >
            <div style={{ flex: 1 }}></div>

            <KnappBase mini={true} type={'flat'}>
                Gå til revurderingen
            </KnappBase>

            <KnappBase mini={true} type={'flat'}>
                Gå til saksoversikt
            </KnappBase>

            <Behandlingsmeny fagsak={fagsak} />
        </Visittkort>
    );
};

export default Personlinje;
