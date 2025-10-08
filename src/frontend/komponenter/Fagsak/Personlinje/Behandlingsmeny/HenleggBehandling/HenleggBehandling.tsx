import type { Behandling } from '../../../../../typer/behandling';

import * as React from 'react';
import { useEffect, useState } from 'react';

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
};

export const HenleggBehandling: React.FC<Props> = ({ behandling }) => {
    const [årsaker, settÅrsaker] = useState<Behandlingresultat[]>([]);
    const [visModal, settVisModal] = useState(false);

    useEffect(() => {
        settÅrsaker(getÅrsaker(behandling));
    }, [behandling]);

    return (
        <>
            <BehandlingsMenyButton
                variant="tertiary"
                disabled={!behandling.kanHenleggeBehandling || !behandling.kanEndres}
                onClick={() => settVisModal(true)}
            >
                Henlegg behandlingen og avslutt
            </BehandlingsMenyButton>

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
