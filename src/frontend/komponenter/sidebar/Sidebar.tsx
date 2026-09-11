import type { FC } from 'react';

import { Activity, useCallback, useEffect, useRef } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
import { useSidebarStore } from '@/stores/sidebarStore';

import { SidebarPanel } from './SidebarPanel';
import { SidebarSnarveier } from './SidebarSnarveier';
import { SIDEBAR_PANEL_ID, SidebarVeksleknapp } from './SidebarVeksleknapp';
import { useSidebarVisning } from './useSidebarVisning';

export const Sidebar: FC = () => {
    const { behandlingId } = useBehandling();
    const { erStorSkjerm, visPanel, tarOverSkjermen, lukkPåSmalSkjerm } = useSidebarVisning();
    const veksleknappIPanelRef = useRef<HTMLButtonElement>(null);
    const veksleknappIKompaktvisningRef = useRef<HTMLButtonElement>(null);
    const aktivTabRef = useRef<HTMLButtonElement>(null);
    const fokusmål = useRef<'veksleknapp' | 'panel' | null>(null);
    const nullstillValgtSide = useSidebarStore(state => state.nullstillValgtSide);

    const fokuserVeksleknapp = useCallback((): void => {
        const knapp = visPanel
            ? veksleknappIPanelRef.current
            : veksleknappIKompaktvisningRef.current;
        knapp?.focus();
    }, [visPanel]);

    const forrigeBehandlingId = useRef(behandlingId);
    useEffect(() => {
        if (forrigeBehandlingId.current !== behandlingId) {
            forrigeBehandlingId.current = behandlingId;
            nullstillValgtSide();
        }
    }, [behandlingId, nullstillValgtSide]);

    useEffect(() => {
        const mål = fokusmål.current;
        fokusmål.current = null;
        if (!mål) return;
        if (mål === 'panel' && visPanel) {
            aktivTabRef.current?.focus();
        } else {
            fokuserVeksleknapp();
        }
    }, [visPanel, fokuserVeksleknapp]);

    useEffect(() => {
        if (erStorSkjerm) {
            lukkPåSmalSkjerm();
        }
    }, [erStorSkjerm, lukkPåSmalSkjerm]);

    useEffect(() => {
        if (!tarOverSkjermen) return;
        const håndterEscape = (event: KeyboardEvent): void => {
            if (event.key !== 'Escape' || event.defaultPrevented) return;
            if (document.querySelector('dialog[open]')) return;
            fokusmål.current = 'veksleknapp';
            lukkPåSmalSkjerm();
        };
        document.addEventListener('keydown', håndterEscape);
        return (): void => document.removeEventListener('keydown', håndterEscape);
    }, [tarOverSkjermen, lukkPåSmalSkjerm]);

    return (
        <aside
            id={SIDEBAR_PANEL_ID}
            aria-label="Informasjonspanel"
            className={`flex flex-col min-h-0 ${
                visPanel
                    ? 'min-w-0 gap-2'
                    : 'w-16 shrink-0 items-center p-4 pt-4 gap-4 rounded-2xl border border-ax-border-brand-blue-subtle bg-ax-bg-default'
            }`}
        >
            <Activity key={behandlingId} mode={visPanel ? 'visible' : 'hidden'}>
                <SidebarPanel
                    aktivTabRef={aktivTabRef}
                    veksleknapp={
                        <SidebarVeksleknapp
                            ref={veksleknappIPanelRef}
                            onVeksle={(): void => {
                                fokusmål.current = 'veksleknapp';
                            }}
                        />
                    }
                />
            </Activity>
            {!visPanel && (
                <>
                    <SidebarVeksleknapp
                        ref={veksleknappIKompaktvisningRef}
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
    );
};
