import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import KnappBase from 'nav-frontend-knapper';

import { RessursStatus } from '@navikt/familie-typer';
import Visittkort from '@navikt/familie-visittkort';

import { useBehandling } from '../../../context/BehandlingContext';
import { IFagsak } from '../../../typer/fagsak';
import { IPerson } from '../../../typer/person';
import { hentAlder } from '../../../utils/dateUtils';
import Behandlingsmeny from './Behandlingsmeny/Behandlingsmeny';

const PlaceholderDiv = styled.div`
    flex: 1;
`;

const StyledContainer = styled.div`
    .visittkort {
        padding: 0 1rem;
        border-bottom-color: ${navFarger.navGra20} !important;

        &__lenke {
            margin: 0 3rem;
        }
        &__status {
            text-indent: 1rem;
        }
    }
`;

interface IProps {
    bruker: IPerson;
    fagsak: IFagsak;
}

const Personlinje: React.FC<IProps> = ({ bruker, fagsak }) => {
    const { åpenBehandling } = useBehandling();
    return (
        <StyledContainer>
            <Visittkort
                navn={bruker.navn}
                ident={bruker.personIdent}
                kjønn={bruker.kjønn}
                alder={hentAlder(bruker.fødselsdato)}
            >
                <PlaceholderDiv />

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
        </StyledContainer>
    );
};

export default Personlinje;
