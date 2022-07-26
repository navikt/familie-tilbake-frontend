import * as React from 'react';

import { Behandlingresultat, Behandlingstype, IBehandling } from '../../../../../typer/behandling';
import { IFagsak } from '../../../../../typer/fagsak';
import { BehandlingsMenyButton } from '../../../../Felleskomponenter/Flytelementer';
import HenleggBehandlingModal from './HenleggBehandlingModal/HenleggBehandlingModal';

const getÅrsaker = (behandling: IBehandling) => {
    if (behandling.type === Behandlingstype.TILBAKEKREVING) {
        return [Behandlingresultat.HENLAGT_FEILOPPRETTET];
    } else {
        return [
            Behandlingresultat.HENLAGT_FEILOPPRETTET_MED_BREV,
            Behandlingresultat.HENLAGT_FEILOPPRETTET_UTEN_BREV,
        ];
    }
};

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
    onListElementClick: () => void;
}

const HenleggBehandling: React.FC<IProps> = ({ behandling, fagsak, onListElementClick }) => {
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
