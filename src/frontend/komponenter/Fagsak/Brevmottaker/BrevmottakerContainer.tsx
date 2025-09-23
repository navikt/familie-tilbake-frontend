import { PlusCircleIcon } from '@navikt/aksel-icons';
import { Button, Heading } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

import Brevmottaker from './Brevmottaker';
import { useBrevmottaker } from './BrevmottakerContext';
import { LeggTilEndreBrevmottakerModal } from './LeggTilEndreBrevmottakerModal';
import { useBehandling } from '../../../context/BehandlingContext';
import { MottakerType } from '../../../typer/Brevmottaker';
import { ActionBar } from '../ActionBar/ActionBar';

const FlexDiv = styled.div`
    display: flex;
    justify-content: start;
`;

const LeggTilKnapp = styled(Button)`
    margin-top: 1rem;
`;

const BrevmottakerContainer: React.FC = () => {
    const { behandling, brevmottakere, gåTilNeste } = useBrevmottaker();
    const { behandlingILesemodus, visBrevmottakerModal, settVisBrevmottakerModal, åpenHøyremeny } =
        useBehandling();
    const erLesevisning = !!behandlingILesemodus;

    const antallBrevmottakere = Object.keys(brevmottakere).length;

    return (
        <div className="py-4 mb-24 border-border-divider border-1 rounded-2xl px-6 bg-white">
            {visBrevmottakerModal && <LeggTilEndreBrevmottakerModal />}
            <Heading size="small" level="1">
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
                                MottakerType.Dødsbo !== brevmottakere[id].type && (
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

            <ActionBar
                forrigeTekst={undefined}
                nesteTekst="Neste"
                forrigeAriaLabel={undefined}
                nesteAriaLabel="Gå videre til neste steg"
                åpenHøyremeny={åpenHøyremeny}
                onNeste={gåTilNeste}
                onForrige={undefined}
            />
        </div>
    );
};

export default BrevmottakerContainer;
