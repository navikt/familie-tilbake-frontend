import type { Menysider } from '@/komponenter/sidebar/menysider';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SidebarState = {
    erÅpen: boolean;
    valgtSide: Menysider | null;
    veksleÅpen: () => void;
    lukk: () => void;
    settValgtSide: (side: Menysider) => void;
    åpneMedSide: (side: Menysider) => void;
    nullstillValgtSide: () => void;
};

export const useSidebarStore = create<SidebarState>()(
    persist(
        set => ({
            erÅpen: true,
            valgtSide: null,
            veksleÅpen: (): void => {
                set(state => ({ erÅpen: !state.erÅpen }));
            },
            lukk: (): void => {
                set({ erÅpen: false });
            },
            settValgtSide: (side: Menysider): void => {
                set({ valgtSide: side });
            },
            åpneMedSide: (side: Menysider): void => {
                set({ erÅpen: true, valgtSide: side });
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
