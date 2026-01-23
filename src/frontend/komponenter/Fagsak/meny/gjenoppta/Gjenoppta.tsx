import { TimerStartIcon } from '@navikt/aksel-icons';
import { ActionMenu, BodyLong, Button, ErrorMessage, Modal } from '@navikt/ds-react';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useRef } from 'react';

import { useBehandling } from '../../../../context/BehandlingContext';
import { hentBehandlingQueryKey } from '../../../../generated/@tanstack/react-query.gen';
import { usePåVentBehandling } from '../../../Felleskomponenter/Modal/PåVent/PåVentContext';
import { MODAL_BREDDE } from '../utils';

export const Gjenoppta: React.FC = () => {
    const behandling = useBehandling();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const queryClient = useQueryClient();

    const lukkModalOgHentBehandling = (): void => {
        dialogRef.current?.close();
        queryClient.invalidateQueries({
            queryKey: hentBehandlingQueryKey({ path: { behandlingId: behandling.behandlingId } }),
        });
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
                    icon: <TimerStartIcon aria-hidden className="mr-2" />,
                }}
                className={MODAL_BREDDE}
            >
                <Modal.Body className="flex flex-col gap-2">
                    <BodyLong>Ønsker du å gjenoppta behandlingen?</BodyLong>
                    {!!feilmelding && <ErrorMessage size="small">{feilmelding}</ErrorMessage>}
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
