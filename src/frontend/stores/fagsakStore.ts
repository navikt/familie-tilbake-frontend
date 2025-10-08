import type { Fagsak } from '../typer/fagsak';

import { create } from 'zustand';

export type FagsakState = {
    eksternFagsakId: Fagsak['eksternFagsakId'] | undefined;
    ytelsestype: Fagsak['ytelsestype'] | undefined;
    fagsystem: Fagsak['fagsystem'] | undefined;
    språkkode: Fagsak['språkkode'] | undefined;
    setEksternFagsakId: (eksternFagsakId: Fagsak['eksternFagsakId'] | undefined) => void;
    setYtelsestype: (ytelsestype: Fagsak['ytelsestype'] | undefined) => void;
    setFagsystem: (fagSystem: Fagsak['fagsystem'] | undefined) => void;
    setSpråkkode: (språkkode: Fagsak['språkkode'] | undefined) => void;
};

export const useFagsakStore = create<FagsakState>(set => ({
    eksternFagsakId: undefined,
    ytelsestype: undefined,
    fagsystem: undefined,
    språkkode: undefined,
    setEksternFagsakId: (eksternFagsakId: Fagsak['eksternFagsakId'] | undefined): void =>
        set({ eksternFagsakId }),
    setYtelsestype: (ytelsestype: Fagsak['ytelsestype'] | undefined): void => set({ ytelsestype }),
    setFagsystem: (fagsystem: Fagsak['fagsystem'] | undefined): void => set({ fagsystem }),
    setSpråkkode: (språkkode: Fagsak['språkkode'] | undefined): void => set({ språkkode }),
}));
