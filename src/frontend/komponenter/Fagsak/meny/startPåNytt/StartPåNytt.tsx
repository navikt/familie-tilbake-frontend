import type { Behandling } from '../../../../typer/behandling';

import { ArrowCirclepathReverseIcon } from '@navikt/aksel-icons';
import { ActionMenu, BodyLong, Button, Modal } from '@navikt/ds-react';
import * as React from 'react';
import { useRef } from 'react';

import { useStartPåNytt } from './useStartPåNytt';
import { useBehandling } from '../../../../context/BehandlingContext';
import { useFagsak } from '../../../../context/FagsakContext';
import { useRedirectEtterLagring } from '../../../../hooks/useRedirectEtterLagring';
import { RessursStatus } from '../../../../typer/ressurs';
import { FeilModal } from '../../../Felleskomponenter/Modal/Feil/FeilModal';
import { MODAL_BREDDE } from '../utils';

type Props = {
    behandling: Behandling;
};

export const StartPåNytt: React.FC<Props> = ({ behandling }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const { hentBehandlingMedBehandlingId, nullstillIkkePersisterteKomponenter } = useBehandling();
    const { utførRedirect } = useRedirectEtterLagring();
    const { fagsak } = useFagsak();
    const fagsystem = fagsak.fagsystem;
    const eksternFagsakId = fagsak.eksternFagsakId;
    const mutation = useStartPåNytt();

    const handleNullstill = (): void => {
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
                <span className="ml-1">Start på nytt</span>
            </ActionMenu.Item>

            <Modal
                ref={dialogRef}
                header={{
                    heading: 'Start behandlingen på nytt',
                    icon: <ArrowCirclepathReverseIcon aria-hidden className="mr-2" />,
                }}
                className={MODAL_BREDDE}
            >
                <Modal.Body>
                    <BodyLong>
                        Dersom du starter på nytt, vil alt arbeid som er gjort i denne behandlingen
                        bli slettet. Denne handlingen kan ikke angres.
                    </BodyLong>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleNullstill}>Start på nytt</Button>
                    <Button variant="secondary" onClick={() => dialogRef.current?.close()}>
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>

            {mutation.isError && (
                <FeilModal
                    feil={mutation.error}
                    lukkFeilModal={mutation.reset}
                    behandlingId={behandling.behandlingId}
                />
            )}
        </>
    );
};
