import type { BehandlingstypeEnum } from '../../../../generated';

import { CircleSlashIcon } from '@navikt/aksel-icons';
import { ActionMenu } from '@navikt/ds-react';
import * as React from 'react';
import { useRef } from 'react';

import { HenleggModal } from './henleggModal/HenleggModal';
import { useBehandling } from '../../../../context/BehandlingContext';
import { Behandlingresultat } from '../../../../typer/behandling';

const hentÅrsaker = (behandlingstype: BehandlingstypeEnum): Behandlingresultat[] => {
    if (behandlingstype === 'TILBAKEKREVING') {
        return [Behandlingresultat.HenlagtFeilopprettet];
    } else {
        return [
            Behandlingresultat.HenlagtFeilopprettetMedBrev,
            Behandlingresultat.HenlagtFeilopprettetUtenBrev,
        ];
    }
};

export const Henlegg: React.FC = () => {
    const behandling = useBehandling();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const årsaker = hentÅrsaker(behandling.type);

    return (
        <>
            <ActionMenu.Item
                onSelect={() => dialogRef.current?.showModal()}
                icon={<CircleSlashIcon aria-hidden />}
                className="text-xl cursor-pointer"
            >
                <span className="ml-1">Henlegg</span>
            </ActionMenu.Item>

            <HenleggModal dialogRef={dialogRef} årsaker={årsaker} />
        </>
    );
};
