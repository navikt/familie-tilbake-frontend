import type { Menysider } from './menysider';

import { useErStorSkjerm } from '@/hooks/useErStorSkjerm';
import { useSidebarStore } from '@/stores/sidebarStore';

type SidebarVisning = {
    erStorSkjerm: boolean;
    visPanel: boolean;
    visModal: boolean;
    innholdErSynlig: boolean;
    veksle: () => void;
    åpneSide: (side: Menysider) => void;
    lukkModal: () => void;
};

export const useSidebarVisning = (): SidebarVisning => {
    const erStorSkjerm = useErStorSkjerm();
    const erÅpen = useSidebarStore(state => state.erÅpen);
    const modalErÅpen = useSidebarStore(state => state.modalErÅpen);
    const veksleÅpen = useSidebarStore(state => state.veksleÅpen);
    const åpne = useSidebarStore(state => state.åpne);
    const åpneModal = useSidebarStore(state => state.åpneModal);
    const lukkModal = useSidebarStore(state => state.lukkModal);
    const settValgtSide = useSidebarStore(state => state.settValgtSide);

    const visPanel = erStorSkjerm && erÅpen;
    const visModal = !erStorSkjerm && modalErÅpen;

    const veksle = (): void => {
        if (erStorSkjerm) {
            veksleÅpen();
        } else if (modalErÅpen) {
            lukkModal();
        } else {
            åpneModal();
        }
    };

    const åpneSide = (side: Menysider): void => {
        settValgtSide(side);
        if (erStorSkjerm) {
            åpne();
        } else {
            åpneModal();
        }
    };

    return {
        erStorSkjerm,
        visPanel,
        visModal,
        innholdErSynlig: visPanel || visModal,
        veksle,
        åpneSide,
        lukkModal,
    };
};
