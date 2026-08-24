import type { FC, MouseEventHandler, RefObject } from 'react';

import { Modal } from '@navikt/ds-react';
import { useEffect } from 'react';

import { useBehandlingState } from '@/context/BehandlingStateContext';
import { useSidebarErÅpen } from '@/stores/sidebarStore';

import { SidebarLayout } from './SidebarLayout';
import { SidebarSnarveier } from './SidebarSnarveier';
import { SIDEBAR_PANEL_ID, SidebarVeksleknapp } from './SidebarVeksleknapp';

type Props = {
    dialogRef: RefObject<HTMLDialogElement | null>;
};

export const Sidebar: FC<Props> = ({ dialogRef }: Props) => {
    const { ventegrunn } = useBehandlingState();
    const erÅpen = useSidebarErÅpen();

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
            {/* Reduserer høyden med header(48)-høyde og padding(16+16)-høyde til fagsakcontainer */}
            <aside
                id={SIDEBAR_PANEL_ID}
                aria-label="Informasjon om tilbakekrevingen og bruker"
                className={`flex-col hidden ax-lg:flex ${ventegrunn ? 'h-[calc(100vh-142px)]' : 'h-[calc(100vh-80px)]'} ${
                    erÅpen
                        ? 'min-w-0 gap-2'
                        : 'w-16 shrink-0 items-center p-4 gap-4 rounded-2xl border border-ax-border-brand-blue-subtle bg-ax-bg-default'
                }`}
            >
                {erÅpen ? (
                    <SidebarLayout veksleknapp={<SidebarVeksleknapp />} />
                ) : (
                    <SidebarSnarveier />
                )}
            </aside>

            <Modal
                ref={dialogRef}
                aria-label="Informasjon om tilbakekrevingen og bruker"
                className="h-full mr-2 my-2"
                onClick={handleKlikkUtenforModal}
            >
                <Modal.Header />
                <Modal.Body className="flex flex-col gap-4 pt-1">
                    <SidebarLayout />
                </Modal.Body>
            </Modal>
        </>
    );
};
