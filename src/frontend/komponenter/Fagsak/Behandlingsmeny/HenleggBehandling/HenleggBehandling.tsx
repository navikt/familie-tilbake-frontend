import type { Behandling } from '../../../../typer/behandling';

import { CircleSlashIcon } from '@navikt/aksel-icons';
import { ActionMenu } from '@navikt/ds-react';
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
        <ActionMenu.Item
            onSelect={() => settVisModal(true)}
            icon={<CircleSlashIcon aria-hidden />}
            className="text-xl"
        >
            Henlegg
            <HenleggBehandlingModal
                behandling={behandling}
                visModal={visModal}
                settVisModal={settVisModal}
                årsaker={årsaker}
            />
        </ActionMenu.Item>
    );
};
