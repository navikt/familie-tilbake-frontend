import { PlusCircleIcon } from '@navikt/aksel-icons';
import { Button, Heading } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

import Brevmottaker from './Brevmottaker';
import { useBrevmottaker } from './BrevmottakerContext';
import { LeggTilEndreBrevmottakerModal } from './LeggTilEndreBrevmottakerModal';
import { useBehandling } from '../../../context/BehandlingContext';
import { MottakerType } from '../../../typer/Brevmottaker';

const StyledBrevmottaker = styled.div`
    padding: 2.5rem;
`;

const FlexDiv = styled.div`
    display: flex;
    justify-content: start;
`;

const LeggTilKnapp = styled(Button)`
    margin-top: 1rem;
`;

const NesteKnapp = styled(Button)`
    margin-top: 3rem;
`;

const BrevmottakerContainer: React.FC = () => {
    const { behandling, brevmottakere, gåTilNeste } = useBrevmottaker();
    const { behandlingILesemodus, visBrevmottakerModal, settVisBrevmottakerModal } =
        useBehandling();
    const erLesevisning = !!behandlingILesemodus;

    const antallBrevmottakere = Object.keys(brevmottakere).length;

    return (
        <div>
            {visBrevmottakerModal && <LeggTilEndreBrevmottakerModal />}
            <StyledBrevmottaker>
                <Heading size="large" level="1">
                    Brevmottaker(e)
                </Heading>
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
                                    antallBrevmottakere={antallBrevmottakere}
                                />
                                {antallBrevmottakere == 1 &&
                                    !erLesevisning &&
                                    MottakerType.DØDSBO !== brevmottakere[id].type && (
                                        <LeggTilKnapp
                                            variant="tertiary"
                                            size="small"
                                            icon={<PlusCircleIcon />}
                                            onClick={() => settVisBrevmottakerModal(true)}
                                        >
                                            Legg til ny mottaker
                                        </LeggTilKnapp>
                                    )}
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
