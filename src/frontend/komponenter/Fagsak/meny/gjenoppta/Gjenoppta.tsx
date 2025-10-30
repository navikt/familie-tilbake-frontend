import type { Behandling } from '../../../../typer/behandling';

import { TimerStartIcon } from '@navikt/aksel-icons';
import { ActionMenu, BodyLong, Button, ErrorMessage, Modal } from '@navikt/ds-react';
import * as React from 'react';
import { useRef } from 'react';

import { useBehandling } from '../../../../context/BehandlingContext';
import { usePåVentBehandling } from '../../../Felleskomponenter/Modal/PåVent/PåVentContext';

type Props = {
    behandling: Behandling;
};

export const GjennoptaBehandling: React.FC<Props> = ({ behandling }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const { hentBehandlingMedBehandlingId } = useBehandling();

    const lukkModalOgHentBehandling = (): void => {
        dialogRef.current?.close();
        hentBehandlingMedBehandlingId(behandling.behandlingId);
    };

    const { feilmelding, onOkTaAvVent } = usePåVentBehandling(lukkModalOgHentBehandling);
    return (
        <>
            <ActionMenu.Item
                onSelect={() => dialogRef.current?.showModal()}
                className="text-xl cursor-pointer"
                icon={<TimerStartIcon aria-hidden />}
            >
                <span className="ml-1">Gjenoppta</span>
            </ActionMenu.Item>

            <Modal
                ref={dialogRef}
                header={{
                    heading: 'Gjenoppta behandlingen',
                    size: 'medium',
                    icon: <TimerStartIcon aria-hidden className="mr-2" />,
                }}
                className="w-150"
            >
                <Modal.Body className="flex flex-col gap-2">
                    <BodyLong>Ønsker du å gjenoppta behandlingen?</BodyLong>
                    {feilmelding && feilmelding !== '' && (
                        <ErrorMessage size="small">{feilmelding}</ErrorMessage>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button key="bekreft" onClick={() => onOkTaAvVent(behandling.behandlingId)}>
                        Gjenoppta
                    </Button>
                    <Button
                        variant="secondary"
                        key="avbryt"
                        onClick={() => dialogRef.current?.close()}
                    >
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
