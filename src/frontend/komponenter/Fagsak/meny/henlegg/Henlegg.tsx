import type { Behandling } from '../../../../typer/behandling';

import { CircleSlashIcon } from '@navikt/aksel-icons';
import { ActionMenu } from '@navikt/ds-react';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import { HenleggModal } from './henleggModal/HenleggModal';
import { Behandlingresultat, Behandlingstype } from '../../../../typer/behandling';

const hentÅrsaker = (behandlingstype: Behandlingstype): Behandlingresultat[] => {
    if (behandlingstype === Behandlingstype.Tilbakekreving) {
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

export const Henlegg: React.FC<Props> = ({ behandling }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [årsaker, setÅrsaker] = useState<Behandlingresultat[]>([]);

    useEffect(() => {
        setÅrsaker(hentÅrsaker(behandling.type));
    }, [behandling]);

    return (
        <>
            <ActionMenu.Item
                onSelect={() => dialogRef.current?.showModal()}
                icon={<CircleSlashIcon aria-hidden />}
                className="text-xl cursor-pointer"
            >
                <span className="ml-1">Henlegg</span>
            </ActionMenu.Item>

            <HenleggModal behandling={behandling} dialogRef={dialogRef} årsaker={årsaker} />
        </>
    );
};
