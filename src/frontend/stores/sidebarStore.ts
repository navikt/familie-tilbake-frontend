import type { Menysider } from '@/komponenter/sidebar/menysider';

import { create } from 'zustand';

export type SidebarState = {
    erÅpen: boolean;
    valgtSide: Menysider | null;
    veksleÅpen: () => void;
    settValgtSide: (side: Menysider) => void;
    åpneMedSide: (side: Menysider) => void;
};

export const useSidebarStore = create<SidebarState>(set => ({
    erÅpen: true,
    valgtSide: null,
    veksleÅpen: (): void => set(state => ({ erÅpen: !state.erÅpen })),
    settValgtSide: (side: Menysider): void => set({ valgtSide: side }),
    åpneMedSide: (side: Menysider): void => set({ erÅpen: true, valgtSide: side }),
}));

export const useSidebarErÅpen = (): boolean => useSidebarStore(state => state.erÅpen);
