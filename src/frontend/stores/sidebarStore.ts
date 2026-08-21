import { create } from 'zustand';

export type SidebarState = {
    erÅpen: boolean;
    veksleÅpen: () => void;
};

export const useSidebarStore = create<SidebarState>(set => ({
    erÅpen: true,
    veksleÅpen: (): void => set(state => ({ erÅpen: !state.erÅpen })),
}));

export const useSidebarErÅpen = (): boolean => useSidebarStore(state => state.erÅpen);
