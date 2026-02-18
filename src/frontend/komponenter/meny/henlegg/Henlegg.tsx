import type { BehandlingsresultatstypeEnum, BehandlingstypeEnum } from '@generated';

import { useBehandling } from '@context/BehandlingContext';
import { CircleSlashIcon } from '@navikt/aksel-icons';
import { ActionMenu } from '@navikt/ds-react';
import * as React from 'react';
import { useRef } from 'react';

import { HenleggModal } from './henleggModal/HenleggModal';

const hentÅrsaker = (behandlingstype: BehandlingstypeEnum): BehandlingsresultatstypeEnum[] => {
    if (behandlingstype === 'TILBAKEKREVING') {
        return ['HENLAGT_FEILOPPRETTET'];
    } else {
        return ['HENLAGT_FEILOPPRETTET_MED_BREV', 'HENLAGT_FEILOPPRETTET_UTEN_BREV'];
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
