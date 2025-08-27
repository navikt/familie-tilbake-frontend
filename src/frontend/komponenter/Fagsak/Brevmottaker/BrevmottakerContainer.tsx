import { PlusCircleIcon } from '@navikt/aksel-icons';
import { Button, Heading } from '@navikt/ds-react';
import * as React from 'react';
import { useNavigate } from 'react-router';

import Brevmottaker from './Brevmottaker';
import { LeggTilEndreBrevmottakerModal } from './LeggTilEndreBrevmottakerModal';
import { useBehandling } from '../../../context/BehandlingContext';
import { useFagsak } from '../../../context/FagsakContext';
import { MottakerType, type IBrevmottaker } from '../../../typer/Brevmottaker';
import { sider } from '../../Felleskomponenter/Venstremeny/sider';

const BrevmottakerContainer: React.FC = () => {
    const { behandling, behandlingILesemodus, visBrevmottakerModal, settVisBrevmottakerModal } =
        useBehandling();
    const { fagsak } = useFagsak();
    const navigate = useNavigate();

    const erLesevisning = !!behandlingILesemodus;

    // Beregn brevmottakere direkte fra behandling
    const brevmottakere = React.useMemo(() => {
        const manuelleBrevmottakere: { [id: string]: IBrevmottaker } = {};
        if (behandling?.status === 'SUKSESS') {
            behandling.data.manuelleBrevmottakere.forEach(value => {
                manuelleBrevmottakere[value.id] = value.brevmottaker;
            });
        }
        return manuelleBrevmottakere;
    }, [behandling]);

    const antallBrevmottakere = Object.keys(brevmottakere).length;

    const gåTilNeste = (): void => {
        if (behandling?.status === 'SUKSESS' && fagsak?.status === 'SUKSESS') {
            navigate(
                `/fagsystem/${fagsak.data.fagsystem}/fagsak/${fagsak.data.eksternFagsakId}/behandling/${behandling.data.eksternBrukId}/${sider.FAKTA.href}`
            );
        }
    };

    if (behandling?.status !== 'SUKSESS' || fagsak?.status !== 'SUKSESS') {
        return null; // eller loading spinner
    }

    console.log('brevmottakere', behandling);

    return (
        <div>
            {visBrevmottakerModal && <LeggTilEndreBrevmottakerModal />}
            <div>
                <Heading size="large" level="1">
                    Brevmottaker(e)
                </Heading>
                <div>
                    {Object.keys(brevmottakere)
                        .sort((a, b) => brevmottakere[a].type.localeCompare(brevmottakere[b].type))
                        .map(id => (
                            <div key={id}>
                                <Brevmottaker
                                    brevmottaker={brevmottakere[id]}
                                    brevmottakerId={id}
                                    behandlingId={behandling.data.behandlingId}
                                    erLesevisning={erLesevisning}
                                    antallBrevmottakere={antallBrevmottakere}
                                />
                                {antallBrevmottakere == 1 &&
                                    !erLesevisning &&
                                    MottakerType.Dødsbo !== brevmottakere[id].type && (
                                        <Button
                                            variant="tertiary"
                                            size="small"
                                            icon={<PlusCircleIcon />}
                                            onClick={() => settVisBrevmottakerModal(true)}
                                        >
                                            Legg til ny mottaker
                                        </Button>
                                    )}
                            </div>
                        ))}
                </div>
                <Button variant="primary" onClick={gåTilNeste}>
                    Neste
                </Button>
            </div>
        </div>
    );
};

export default BrevmottakerContainer;
