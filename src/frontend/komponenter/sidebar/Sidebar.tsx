import type { FC, MouseEventHandler, RefObject } from 'react';

import { Modal } from '@navikt/ds-react';
import { useEffect, useRef } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
import { useErStorSkjerm } from '@/hooks/useErStorSkjerm';
import { useSidebarErÅpen, useSidebarStore } from '@/stores/sidebarStore';

import { SidebarPanel } from './SidebarPanel';
import { SidebarSnarveier } from './SidebarSnarveier';
import { SIDEBAR_PANEL_ID, SidebarVeksleknapp } from './SidebarVeksleknapp';

type Props = {
    dialogRef: RefObject<HTMLDialogElement | null>;
};

export const Sidebar: FC<Props> = ({ dialogRef }: Props) => {
    const { behandlingId } = useBehandling();
    const erÅpen = useSidebarErÅpen();
    const erStorSkjerm = useErStorSkjerm();
    const nullstillValgtSide = useSidebarStore(state => state.nullstillValgtSide);
    const lukk = useSidebarStore(state => state.lukk);

    // Sidebaren har bare plass som panel på store skjermer. På smale skjermer vises
    // den som en smal ikonkolonne, og selve innholdet åpnes i en modal.
    const visPanel = erÅpen && erStorSkjerm;

    const forrigeBehandlingId = useRef(behandlingId);
    useEffect(() => {
        if (forrigeBehandlingId.current !== behandlingId) {
            forrigeBehandlingId.current = behandlingId;
            nullstillValgtSide();
        }
    }, [behandlingId, nullstillValgtSide]);

    const skalViseModal = erÅpen && !erStorSkjerm;
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (skalViseModal && !dialog.open) {
            dialog.showModal();
        } else if (!skalViseModal && dialog.open) {
            dialog.close();
        }
    }, [skalViseModal, dialogRef]);

    // Åpen-tilstanden er persistert og hører til panelvisningen. Uten dette ville en
    // åpen sidebar fra en bredere skjerm slått opp en modal med én gang siden lastes.
    useEffect(() => {
        if (!erStorSkjerm) {
            lukk();
        }
    }, [erStorSkjerm, lukk]);

    const handleKlikkUtenforModal: MouseEventHandler<HTMLDialogElement> = (
        e: React.MouseEvent<HTMLDialogElement, MouseEvent>
    ): void => {
        if (e.target === e.currentTarget) {
            (e.currentTarget as HTMLDialogElement).close();
        }
    };

    return (
        <>
            <aside
                id={SIDEBAR_PANEL_ID}
                aria-label="Informasjon om tilbakekrevingen og bruker"
                className={`flex flex-col min-h-0 ${
                    visPanel
                        ? 'min-w-0 gap-2'
                        : 'w-16 shrink-0 items-center p-4 pt-4 gap-4 rounded-2xl border border-ax-border-brand-blue-subtle bg-ax-bg-default'
                }`}
            >
                {visPanel ? (
                    <SidebarPanel veksleknapp={<SidebarVeksleknapp />} />
                ) : (
                    <>
                        <SidebarVeksleknapp />
                        <SidebarSnarveier />
                    </>
                )}
            </aside>

            <Modal
                ref={dialogRef}
                aria-label="Informasjon om tilbakekrevingen og bruker"
                className="h-full mr-2 my-2"
                onClick={handleKlikkUtenforModal}
                onClose={lukk}
            >
                <Modal.Header />
                <Modal.Body className="flex flex-col gap-4">
                    <SidebarPanel />
                </Modal.Body>
            </Modal>
        </>
    );
};
