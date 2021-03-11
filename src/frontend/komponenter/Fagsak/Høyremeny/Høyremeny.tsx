import * as React from 'react';

import styled from 'styled-components';

import { IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import Behandlingskort from '../Behandlingskort/Behandlingskort';

const StyledContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 25rem;
    height: calc(100vh - 8rem);
`;

interface IProps {
    fagsak: IFagsak;
    behandling: IBehandling;
}

const Høyremeny: React.FC<IProps> = ({ fagsak, behandling }) => {
    return (
        <StyledContainer>
            <Behandlingskort fagsak={fagsak} behandling={behandling} />
        </StyledContainer>
    );
};

export default Høyremeny;
