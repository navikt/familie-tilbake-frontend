import type { SchemaEnum2 } from '@/generated';

import { create } from 'zustand';

type FagsakStore = {
    tilbakekrevingSakId: string | undefined;
    fagsystem: SchemaEnum2 | undefined;
    personIdent: string | undefined;
    fagsakBehandlingUrl: string | null | undefined;
    setTilbakekrevingSakId: (tilbakekrevingSakId: string | undefined) => void;
    setFagsystem: (fagsystem: SchemaEnum2 | undefined) => void;
    setPersonIdent: (personIdent: string | undefined) => void;
    setFagsakBehandlingUrl: (fagsakBehandlingUrl: string | null | undefined) => void;
    resetFagsak: () => void;
};

export const useFagsakStore = create<FagsakStore>(set => ({
    tilbakekrevingSakId: undefined,
    fagsystem: undefined,
    personIdent: undefined,
    fagsakBehandlingUrl: undefined,
    setTilbakekrevingSakId: (tilbakekrevingSakId: string | undefined): void =>
        set({ tilbakekrevingSakId }),
    setFagsystem: (fagsystem: SchemaEnum2 | undefined): void => set({ fagsystem }),
    setPersonIdent: (personIdent: string | undefined): void => set({ personIdent }),
    setFagsakBehandlingUrl: (fagsakBehandlingUrl: string | null | undefined): void =>
        set({ fagsakBehandlingUrl }),
    resetFagsak: (): void =>
        set({
            tilbakekrevingSakId: undefined,
            fagsystem: undefined,
            personIdent: undefined,
            fagsakBehandlingUrl: undefined,
        }),
}));
