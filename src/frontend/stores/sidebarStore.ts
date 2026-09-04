import type { Menysider } from '@/komponenter/sidebar/menysider';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SidebarState = {
    /** Brukerens ønske om at panelet skal være åpent. Gjelder skjermer med plass til panel. */
    erÅpen: boolean;
    /** Innholdet vist i modal, som er visningsformen på smale skjermer. */
    modalErÅpen: boolean;
    valgtSide: Menysider | null;
    veksleÅpen: () => void;
    åpne: () => void;
    lukk: () => void;
    åpneModal: () => void;
    lukkModal: () => void;
    settValgtSide: (side: Menysider) => void;
    nullstillValgtSide: () => void;
};

export const useSidebarStore = create<SidebarState>()(
    persist(
        set => ({
            erÅpen: true,
            modalErÅpen: false,
            valgtSide: null,
            veksleÅpen: (): void => {
                set(state => ({ erÅpen: !state.erÅpen }));
            },
            åpne: (): void => {
                set({ erÅpen: true });
            },
            lukk: (): void => {
                set({ erÅpen: false });
            },
            åpneModal: (): void => {
                set({ modalErÅpen: true });
            },
            lukkModal: (): void => {
                set({ modalErÅpen: false });
            },
            settValgtSide: (side: Menysider): void => {
                set({ valgtSide: side });
            },
            nullstillValgtSide: (): void => {
                set({ valgtSide: null });
            },
        }),
        {
            name: 'tilbakekreving-sidebar',
            storage: createJSONStorage(() => localStorage),
            // Valgt fane hører til én behandling og skal ikke gjenbrukes i neste økt.
            partialize: (state: SidebarState) => ({ erÅpen: state.erÅpen }),
        }
    )
);

export const useSidebarErÅpen = (): boolean => useSidebarStore(state => state.erÅpen);
