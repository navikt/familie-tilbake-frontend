import { create } from 'zustand';

interface FagsakState {
    personIdent: string | undefined;
    fagsakId: string | undefined;
    behandlingId: string | undefined;
    setPersonIdent: (personIdent: string | undefined) => void;
    setFagsakId: (fagsakId: string | undefined) => void;
    setBehandlingId: (behandlingId: string | undefined) => void;
}

export const useFagsakStore = create<FagsakState>(set => ({
    personIdent: undefined,
    fagsakId: undefined,
    behandlingId: undefined,
    setPersonIdent: personIdent => set({ personIdent }),
    setFagsakId: fagsakId => set({ fagsakId }),
    setBehandlingId: behandlingId => set({ behandlingId }),
}));
