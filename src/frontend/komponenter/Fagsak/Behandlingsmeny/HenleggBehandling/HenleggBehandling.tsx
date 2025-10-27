import type { Behandling } from '../../../../typer/behandling';

import { CircleSlashIcon } from '@navikt/aksel-icons';
import { ActionMenu } from '@navikt/ds-react';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import { HenleggBehandlingModal } from './HenleggBehandlingModal/HenleggBehandlingModal';
import { Behandlingresultat, Behandlingstype } from '../../../../typer/behandling';

const hentÅrsaker = (behandling: Behandling): Behandlingresultat[] => {
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
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [årsaker, setÅrsaker] = useState<Behandlingresultat[]>([]);

    useEffect(() => {
        setÅrsaker(hentÅrsaker(behandling));
    }, [behandling]);

    return (
        <>
            <ActionMenu.Item
                onSelect={() => dialogRef.current?.showModal()}
                icon={<CircleSlashIcon aria-hidden />}
                className="text-xl cursor-pointer"
            >
                Henlegg
            </ActionMenu.Item>

            <HenleggBehandlingModal
                behandling={behandling}
                dialogRef={dialogRef}
                årsaker={årsaker}
            />
        </>
    );
};
