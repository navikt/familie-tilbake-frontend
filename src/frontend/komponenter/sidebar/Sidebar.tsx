import type { FC, MouseEventHandler, RefObject } from 'react';

import { Modal } from '@navikt/ds-react';
import { useEffect, useRef } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
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
    const nullstillValgtSide = useSidebarStore(state => state.nullstillValgtSide);

    const forrigeBehandlingId = useRef(behandlingId);
    useEffect(() => {
        if (forrigeBehandlingId.current !== behandlingId) {
            forrigeBehandlingId.current = behandlingId;
            nullstillValgtSide();
        }
    }, [behandlingId, nullstillValgtSide]);

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)');
        const lukkModalenHvisStørreEnnLg = (): void => {
            if (mq.matches && dialogRef.current?.open) {
                dialogRef.current.close();
            }
        };
        lukkModalenHvisStørreEnnLg();
        mq.addEventListener('change', lukkModalenHvisStørreEnnLg);
        return (): void => mq.removeEventListener('change', lukkModalenHvisStørreEnnLg);
    }, [dialogRef]);

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
                className={`flex-col hidden ax-lg:flex min-h-0 ${
                    erÅpen
                        ? 'min-w-0 gap-2'
                        : 'w-16 shrink-0 items-center p-4 pt-4 gap-4 rounded-2xl border border-ax-border-brand-blue-subtle bg-ax-bg-default'
                }`}
            >
                {erÅpen ? (
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
            >
                <Modal.Header />
                <Modal.Body className="flex flex-col gap-4">
                    <SidebarPanel />
                </Modal.Body>
            </Modal>
        </>
    );
};
