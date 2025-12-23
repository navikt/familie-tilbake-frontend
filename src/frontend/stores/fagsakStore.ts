import type { SchemaEnum2 } from '../generated';

import { create } from 'zustand';

type FagsakStore = {
    eksternFagsakId: string | undefined;
    fagsystem: SchemaEnum2 | undefined;
    setEksternFagsakId: (eksternFagsakId: string | undefined) => void;
    setFagsystem: (fagsystem: SchemaEnum2 | undefined) => void;
    resetFagsak: () => void;
};

export const useFagsakStore = create<FagsakStore>(set => ({
    eksternFagsakId: undefined,
    fagsystem: undefined,
    setEksternFagsakId: (eksternFagsakId: string | undefined): void => set({ eksternFagsakId }),
    setFagsystem: (fagsystem: SchemaEnum2 | undefined): void => set({ fagsystem }),
    resetFagsak: (): void => set({ eksternFagsakId: undefined, fagsystem: undefined }),
}));
