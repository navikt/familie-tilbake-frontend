import { create } from 'zustand';

export type BehandlingState = {
    personIdent: string | undefined;
    behandlingId: string | undefined;
    setPersonIdent: (personIdent: string | undefined) => void;
    setBehandlingId: (behandlingId: string | undefined) => void;
};

export const useBehandlingStore = create<BehandlingState>(set => ({
    personIdent: undefined,
    behandlingId: undefined,
    setPersonIdent: (personIdent: string | undefined): void => set({ personIdent }),
    setBehandlingId: (behandlingId: string | undefined): void => set({ behandlingId }),
}));
