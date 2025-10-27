import type { Behandling } from '../../../../typer/behandling';

import { TimerStartIcon } from '@navikt/aksel-icons';
import { ActionMenu, Button, ErrorMessage, Modal } from '@navikt/ds-react';
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
                Gjenoppta
            </ActionMenu.Item>

            <Modal
                ref={dialogRef}
                header={{ heading: 'Gjenoppta behandlingen', size: 'medium' }}
                width="small"
            >
                <Modal.Body>
                    {feilmelding && feilmelding !== '' && (
                        <ErrorMessage size="small">{feilmelding}</ErrorMessage>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        key="bekreft"
                        onClick={() => onOkTaAvVent(behandling.behandlingId)}
                        size="small"
                    >
                        Ok
                    </Button>
                    <Button
                        variant="tertiary"
                        key="avbryt"
                        onClick={() => dialogRef.current?.close()}
                        size="small"
                    >
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
