import type { FC, MouseEventHandler, RefObject } from 'react';

import { Modal } from '@navikt/ds-react';
import { useEffect, useState } from 'react';

import { useBehandlingState } from '@/context/BehandlingStateContext';
import { useLavViewportHøyde } from '@/hooks/useLavViewportHøyde';
import { useSidebarErÅpen } from '@/stores/sidebarStore';

import { BrukerInformasjon } from './informasjonsbokser/BrukerInformasjon';
import { Faktaboks } from './informasjonsbokser/Faktaboks';
import { HistorikkOgDokumenter } from './OversiktOgHandlinger';
import { SIDEBAR_PANEL_ID, SidebarVeksleknapp } from './SidebarVeksleknapp';

type Props = {
    dialogRef: RefObject<HTMLDialogElement | null>;
};

export const Sidebar: FC<Props> = ({ dialogRef }: Props) => {
    const { ventegrunn } = useBehandlingState();
    const erLavHøyde = useLavViewportHøyde();
    const erÅpen = useSidebarErÅpen();

    const [kortTilstand, setKortTilstand] = useState({
        faktaboksÅpen: !erLavHøyde,
        brukerInfoÅpen: !erLavHøyde,
        forrigeErLavHøyde: erLavHøyde,
    });

    if (erLavHøyde !== kortTilstand.forrigeErLavHøyde) {
        setKortTilstand({
            faktaboksÅpen: !erLavHøyde,
            brukerInfoÅpen: !erLavHøyde,
            forrigeErLavHøyde: erLavHøyde,
        });
    }

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
                className={`flex-col gap-4 hidden ax-lg:flex ${ventegrunn ? 'max-h-[calc(100vh-142px)]' : 'max-h-[calc(100vh-80px)]'} ${
                    erÅpen
                        ? 'min-w-0'
                        : 'w-12 shrink-0 items-center py-2 rounded-2xl border border-ax-border-brand-blue-subtle bg-ax-bg-default'
                }`}
            >
                {erÅpen ? (
                    <>
                        <div className="flex flex-row justify-end">
                            <SidebarVeksleknapp />
                        </div>
                        <Faktaboks
                            open={kortTilstand.faktaboksÅpen}
                            onToggle={(åpen: boolean): void =>
                                setKortTilstand(prev => ({ ...prev, faktaboksÅpen: åpen }))
                            }
                        />
                        <BrukerInformasjon
                            open={kortTilstand.brukerInfoÅpen}
                            onToggle={(åpen: boolean): void =>
                                setKortTilstand(prev => ({ ...prev, brukerInfoÅpen: åpen }))
                            }
                        />
                        <HistorikkOgDokumenter />
                    </>
                ) : (
                    <SidebarVeksleknapp />
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
                    <Faktaboks />
                    <BrukerInformasjon />
                    <HistorikkOgDokumenter />
                </Modal.Body>
            </Modal>
        </>
    );
};
