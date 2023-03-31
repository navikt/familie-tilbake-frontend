import * as React from 'react';

import styled from 'styled-components';

import { Button, Heading } from '@navikt/ds-react';

import { useBehandling } from '../../../context/BehandlingContext';
import Brevmottaker from './Brevmottaker';
import { useBrevmottaker } from './BrevmottakerContext';

const StyledBrevmottaker = styled.div`
    padding: 2.5rem;
`;

const FlexDiv = styled.div`
    display: flex;
    justify-content: start;
`;

const NesteKnapp = styled(Button)`
    margin-top: 3rem;
`;

const BrevmottakerContainer: React.FC = () => {
    const { behandling, brevmottakere, gåTilNeste } = useBrevmottaker();
    const { behandlingILesemodus } = useBehandling();
    const erLesevisning = !!behandlingILesemodus;

    return (
        <div>
            <StyledBrevmottaker>
                <Heading size={'large'} level={'1'} children={'Brevmottaker(e)'} />
                <FlexDiv>
                    {Object.keys(brevmottakere)
                        .sort((a, b) => brevmottakere[a].type.localeCompare(brevmottakere[b].type))
                        .map(id => (
                            <div key={id}>
                                <Brevmottaker
                                    brevmottaker={brevmottakere[id]}
                                    brevmottakerId={id}
                                    behandlingId={behandling.behandlingId}
                                    erLesevisning={erLesevisning}
                                />
                            </div>
                        ))}
                </FlexDiv>
                <NesteKnapp variant="primary" onClick={gåTilNeste}>
                    Neste
                </NesteKnapp>
            </StyledBrevmottaker>
        </div>
    );
};

export default BrevmottakerContainer;
