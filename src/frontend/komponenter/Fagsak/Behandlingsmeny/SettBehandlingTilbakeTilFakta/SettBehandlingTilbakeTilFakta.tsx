import type { Behandling } from '../../../../typer/behandling';

import { ArrowCirclepathReverseIcon } from '@navikt/aksel-icons';
import { ActionMenu, BodyShort, Button, Modal } from '@navikt/ds-react';
import * as React from 'react';
import { useRef } from 'react';

import { useSettBehandlingTilbakeTilFakta } from './useSettBehandlingTilbakeTilFakta';
import { useBehandling } from '../../../../context/BehandlingContext';
import { useRedirectEtterLagring } from '../../../../hooks/useRedirectEtterLagring';
import { useFagsakStore } from '../../../../stores/fagsakStore';
import { RessursStatus } from '../../../../typer/ressurs';
import { FeilModal } from '../../../Felleskomponenter/Modal/Feil/FeilModal';

type Props = {
    behandling: Behandling;
};

export const SettBehandlingTilbakeTilFakta: React.FC<Props> = ({ behandling }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const { hentBehandlingMedBehandlingId, nullstillIkkePersisterteKomponenter } = useBehandling();
    const { utførRedirect } = useRedirectEtterLagring();
    const { fagsystem, eksternFagsakId } = useFagsakStore();
    const mutation = useSettBehandlingTilbakeTilFakta();

    const handleResettBehandling = (): void => {
        nullstillIkkePersisterteKomponenter();
        mutation.mutate(behandling.behandlingId, {
            onSuccess: ressurs => {
                if (ressurs.status === RessursStatus.Suksess && fagsystem && eksternFagsakId) {
                    hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                        utførRedirect(
                            `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}`
                        );
                        window.location.reload();
                    });
                }
            },
            onError: () => dialogRef.current?.close(),
        });
    };

    return (
        <>
            <ActionMenu.Item
                onSelect={() => dialogRef.current?.showModal()}
                icon={<ArrowCirclepathReverseIcon aria-hidden />}
                className="text-xl cursor-pointer"
            >
                Start på nytt
            </ActionMenu.Item>

            <Modal
                ref={dialogRef}
                header={{
                    heading: 'Start på nytt',
                    icon: <ArrowCirclepathReverseIcon aria-hidden />,
                }}
            >
                <Modal.Body>
                    <BodyShort>
                        Ønsker du å starte behandlingen på nytt? Handlingen kan ikke angres.
                    </BodyShort>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleResettBehandling}>Start på nytt</Button>
                    <Button variant="secondary" onClick={() => dialogRef.current?.close()}>
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>

            {mutation.isError && eksternFagsakId && (
                <FeilModal
                    feil={mutation.error}
                    lukkFeilModal={mutation.reset}
                    behandlingId={behandling.behandlingId}
                    fagsakId={eksternFagsakId}
                />
            )}
        </>
    );
};
