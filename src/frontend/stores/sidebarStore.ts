import type { Menysider } from '@/komponenter/sidebar/menysider';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SidebarState = {
    // Brukerens lagrede valg, som gjelder når skjermen har plass til panelet ved siden av.
    erÅpen: boolean;
    // Gjelder kun inneværende økt: på smal skjerm dekker panelet behandlingen, så det skal
    // alltid starte lukket uten å overskrive det lagrede valget over.
    erÅpenPåSmalSkjerm: boolean;
    valgtSide: Menysider | null;
    settÅpen: (åpen: boolean) => void;
    settÅpenPåSmalSkjerm: (åpen: boolean) => void;
    settValgtSide: (side: Menysider) => void;
    nullstillValgtSide: () => void;
};

export const useSidebarStore = create<SidebarState>()(
    persist(
        set => ({
            erÅpen: true,
            erÅpenPåSmalSkjerm: false,
            valgtSide: null,
            settÅpen: (åpen: boolean): void => {
                set({ erÅpen: åpen });
            },
            settÅpenPåSmalSkjerm: (åpen: boolean): void => {
                set({ erÅpenPåSmalSkjerm: åpen });
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
