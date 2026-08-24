import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import { useSidebarStore } from '@/stores/sidebarStore';

import { Menysider } from './menysider';

type Menysidevalg = {
    tilgjengeligeSider: Menysider[];
    aktivSide: Menysider;
};

export const useMenysider = (): Menysidevalg => {
    const { erNyModell, status } = useBehandling();
    const { harVærtPåFatteVedtakSteget } = useBehandlingState();
    const valgtSide = useSidebarStore(state => state.valgtSide);

    const skalViseTotrinn = status === 'FATTER_VEDTAK' || harVærtPåFatteVedtakSteget();

    const tilgjengeligeSider = [
        Menysider.Detaljer,
        Menysider.Historikk,
        Menysider.Dokumenter,
        ...(erNyModell ? [] : [Menysider.SendBrev]),
        ...(skalViseTotrinn ? [Menysider.Totrinn] : []),
    ];

    const defaultSide = skalViseTotrinn ? Menysider.Totrinn : Menysider.Detaljer;
    const erGyldigValg = valgtSide !== null && tilgjengeligeSider.includes(valgtSide);

    return {
        tilgjengeligeSider,
        aktivSide: erGyldigValg ? valgtSide : defaultSide,
    };
};
