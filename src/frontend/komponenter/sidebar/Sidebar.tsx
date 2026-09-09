import type { FC, MouseEventHandler, RefObject } from 'react';

import { Modal } from '@navikt/ds-react';
import { useEffect, useRef } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
import { useSidebarStore } from '@/stores/sidebarStore';

import { SidebarPanel } from './SidebarPanel';
import { SidebarSnarveier } from './SidebarSnarveier';
import { SIDEBAR_PANEL_ID, SidebarVeksleknapp } from './SidebarVeksleknapp';
import { useSidebarVisning } from './useSidebarVisning';

type Props = {
    dialogRef: RefObject<HTMLDialogElement | null>;
};

export const Sidebar: FC<Props> = ({ dialogRef }: Props) => {
    const { behandlingId } = useBehandling();
    const { visPanel, visModal, lukkModal } = useSidebarVisning();
    const veksleknappRef = useRef<HTMLButtonElement>(null);
    const aktivTabRef = useRef<HTMLButtonElement>(null);
    const fokusmål = useRef<'veksleknapp' | 'panel' | null>(null);
    const nullstillValgtSide = useSidebarStore(state => state.nullstillValgtSide);

    const forrigeBehandlingId = useRef(behandlingId);
    useEffect(() => {
        if (forrigeBehandlingId.current !== behandlingId) {
            forrigeBehandlingId.current = behandlingId;
            nullstillValgtSide();
        }
    }, [behandlingId, nullstillValgtSide]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (visModal && !dialog.open) {
            dialog.showModal();
        } else if (!visModal && dialog.open) {
            const fokusVarIModalen = dialog.contains(document.activeElement);
            dialog.close();
            if (fokusVarIModalen) {
                veksleknappRef.current?.focus();
            }
        }
    }, [visModal, dialogRef]);

    useEffect(() => {
        const mål = fokusmål.current;
        fokusmål.current = null;
        if (!mål || visModal) return;
        if (mål === 'panel' && visPanel) {
            aktivTabRef.current?.focus();
        } else {
            veksleknappRef.current?.focus();
        }
    }, [visPanel, visModal]);

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
                aria-label="Informasjonspanel"
                className={`flex flex-col min-h-0 ${
                    visPanel
                        ? 'min-w-0 gap-2'
                        : 'w-16 shrink-0 items-center p-4 pt-4 gap-4 rounded-2xl border border-ax-border-brand-blue-subtle bg-ax-bg-default'
                }`}
            >
                {visPanel ? (
                    <SidebarPanel
                        aktivTabRef={aktivTabRef}
                        veksleknapp={
                            <SidebarVeksleknapp
                                ref={veksleknappRef}
                                onVeksle={(): void => {
                                    fokusmål.current = 'veksleknapp';
                                }}
                            />
                        }
                    />
                ) : (
                    <>
                        <SidebarVeksleknapp
                            ref={veksleknappRef}
                            onVeksle={(): void => {
                                fokusmål.current = 'veksleknapp';
                            }}
                        />
                        <SidebarSnarveier
                            onÅpnetSide={(): void => {
                                fokusmål.current = 'panel';
                            }}
                        />
                    </>
                )}
            </aside>

            <Modal
                ref={dialogRef}
                aria-label="Informasjon om tilbakekrevingen og bruker"
                className="h-full mr-2 my-2"
                onClick={handleKlikkUtenforModal}
                onClose={lukkModal}
            >
                <Modal.Header />
                <Modal.Body className="flex flex-col gap-4">
                    <SidebarPanel />
                </Modal.Body>
            </Modal>
        </>
    );
};
