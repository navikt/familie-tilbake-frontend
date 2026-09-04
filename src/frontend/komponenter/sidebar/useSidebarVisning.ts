import type { Menysider } from './menysider';

import { useErStorSkjerm } from '@/hooks/useErStorSkjerm';
import { useSidebarStore } from '@/stores/sidebarStore';

type SidebarVisning = {
    /** Panelet vises ved siden av innholdet. */
    visPanel: boolean;
    /** Innholdet vises i modal fordi skjermen er for smal til et panel. */
    visModal: boolean;
    /** Om innholdet er synlig i en av de to visningsformene. */
    innholdErSynlig: boolean;
    veksle: () => void;
    åpneSide: (side: Menysider) => void;
    lukkModal: () => void;
};

/**
 * Samler avgjørelsen om hvordan sidebaren vises. Panelet og modalen har hver sin
 * tilstand, slik at et smalt vindu ikke overskriver ønsket om et åpent panel: gjør
 * du vinduet bredt igjen, kommer panelet tilbake slik det var.
 */
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
        visPanel,
        visModal,
        innholdErSynlig: visPanel || visModal,
        veksle,
        åpneSide,
        lukkModal,
    };
};
