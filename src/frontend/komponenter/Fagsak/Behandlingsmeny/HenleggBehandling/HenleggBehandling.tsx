import type { Behandling } from '../../../../typer/behandling';

import { Dropdown } from '@navikt/ds-react';
import * as React from 'react';
import { useEffect, useState } from 'react';

import HenleggBehandlingModal from './HenleggBehandlingModal/HenleggBehandlingModal';
import { Behandlingresultat, Behandlingstype } from '../../../../typer/behandling';

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
};

export const HenleggBehandling: React.FC<Props> = ({ behandling }) => {
    const [årsaker, settÅrsaker] = useState<Behandlingresultat[]>([]);
    const [visModal, settVisModal] = useState(false);

    useEffect(() => {
        settÅrsaker(getÅrsaker(behandling));
    }, [behandling]);

    return (
        <Dropdown.Menu.List.Item
            onClick={() => settVisModal(true)}
            disabled={!behandling.kanHenleggeBehandling || !behandling.kanEndres}
        >
            Henlegg behandlingen og avslutt
            {visModal && (
                <HenleggBehandlingModal
                    behandling={behandling}
                    visModal={visModal}
                    settVisModal={settVisModal}
                    årsaker={årsaker}
                />
            )}
        </Dropdown.Menu.List.Item>
    );
};
