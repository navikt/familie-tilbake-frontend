import type { Behandling } from '../../../../../typer/behandling';
import type { Fagsak } from '../../../../../typer/fagsak';

import * as React from 'react';

import HenleggBehandlingModal from './HenleggBehandlingModal/HenleggBehandlingModal';
import { Behandlingresultat, Behandlingstype } from '../../../../../typer/behandling';
import { BehandlingsMenyButton } from '../../../../Felleskomponenter/Flytelementer';

const getÅrsaker = (behandling: Behandling): Behandlingresultat[] => {
    if (behandling.type === Behandlingstype.Tilbakekreving) {
        return [Behandlingresultat.HenlagtFeilopprettet];
    } else {
        return [
            Behandlingresultat.HenlagtFeilopprettetMedBrev,
            Behandlingresultat.HenlagtFeilopprettetUtenBrev,
        ];
    }
};

type Props = {
    behandling: Behandling;
    fagsak: Fagsak;
    onListElementClick: () => void;
};

const HenleggBehandling: React.FC<Props> = ({ behandling, fagsak, onListElementClick }) => {
    const [årsaker, settÅrsaker] = React.useState<Behandlingresultat[]>([]);
    const [visModal, settVisModal] = React.useState<boolean>(false);

    React.useEffect(() => {
        settÅrsaker(getÅrsaker(behandling));
    }, [behandling]);

    return (
        <>
            <BehandlingsMenyButton
                variant="tertiary"
                disabled={!behandling.kanHenleggeBehandling || !behandling.kanEndres}
                onClick={() => {
                    settVisModal(true);
                    onListElementClick();
                }}
            >
                Henlegg behandlingen og avslutt
            </BehandlingsMenyButton>

            {visModal && (
                <HenleggBehandlingModal
                    behandling={behandling}
                    fagsak={fagsak}
                    visModal={visModal}
                    settVisModal={settVisModal}
                    årsaker={årsaker}
                />
            )}
        </>
    );
};

export default HenleggBehandling;
