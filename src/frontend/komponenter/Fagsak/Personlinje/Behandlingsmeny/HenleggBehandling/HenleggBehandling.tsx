import * as React from 'react';

import KnappBase from 'nav-frontend-knapper';

import { Behandlingresultat, Behandlingstype, IBehandling } from '../../../../../typer/behandling';
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
}

const HenleggBehandling: React.FC<IProps> = ({ behandling }) => {
    const [årsaker, settÅrsaker] = React.useState<Behandlingresultat[]>([]);
    const [visModal, settVisModal] = React.useState<boolean>(false);

    React.useEffect(() => {
        settÅrsaker(getÅrsaker(behandling));
    }, [behandling]);

    return (
        <>
            <KnappBase
                mini={true}
                disabled={!behandling.kanHenleggeBehandling || !behandling.kanEndres}
                onClick={() => settVisModal(true)}
            >
                Henlegg behandlingen og avslutt
            </KnappBase>

            {visModal && (
                <HenleggBehandlingModal
                    behandling={behandling}
                    visModal={visModal}
                    settVisModal={settVisModal}
                    årsaker={årsaker}
                />
            )}
        </>
    );
};

export default HenleggBehandling;
