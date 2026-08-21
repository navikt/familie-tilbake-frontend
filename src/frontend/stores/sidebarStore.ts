import { create } from 'zustand';

export type SidebarState = {
    erÅpen: boolean;
    setErÅpen: (erÅpen: boolean) => void;
    veksleÅpen: () => void;
};

export const useSidebarStore = create<SidebarState>(set => ({
    erÅpen: true,
    setErÅpen: (erÅpen: boolean): void => set({ erÅpen }),
    veksleÅpen: (): void => set(state => ({ erÅpen: !state.erÅpen })),
}));

export const useSidebarErÅpen = (): boolean => useSidebarStore(state => state.erÅpen);
