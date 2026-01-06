import { create } from 'zustand';

export type BehandlingState = {
    behandlingId: string | undefined;
    setBehandlingId: (behandlingId: string | undefined) => void;
};

export const useBehandlingStore = create<BehandlingState>(set => ({
    behandlingId: undefined,
    setBehandlingId: (behandlingId: string | undefined): void => set({ behandlingId }),
}));
