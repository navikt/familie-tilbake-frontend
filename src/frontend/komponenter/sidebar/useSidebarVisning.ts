import type { Menysider } from './menysider';

import { useCallback } from 'react';

import { useErStorSkjerm } from '@/hooks/useErStorSkjerm';
import { useSidebarStore } from '@/stores/sidebarStore';

type SidebarVisning = {
    erStorSkjerm: boolean;
    visPanel: boolean;
    tarOverSkjermen: boolean;
    veksle: () => void;
    lukkPåSmalSkjerm: () => void;
    åpneSide: (side: Menysider) => void;
};

export const useSidebarVisning = (): SidebarVisning => {
    const erStorSkjerm = useErStorSkjerm();
    const erÅpen = useSidebarStore(state => state.erÅpen);
    const erÅpenPåSmalSkjerm = useSidebarStore(state => state.erÅpenPåSmalSkjerm);
    const settÅpen = useSidebarStore(state => state.settÅpen);
    const settÅpenPåSmalSkjerm = useSidebarStore(state => state.settÅpenPåSmalSkjerm);
    const settValgtSide = useSidebarStore(state => state.settValgtSide);

    const visPanel = erStorSkjerm ? erÅpen : erÅpenPåSmalSkjerm;

    const veksle = useCallback((): void => {
        if (erStorSkjerm) {
            settÅpen(!erÅpen);
        } else {
            settÅpenPåSmalSkjerm(!erÅpenPåSmalSkjerm);
        }
    }, [erStorSkjerm, erÅpen, erÅpenPåSmalSkjerm, settÅpen, settÅpenPåSmalSkjerm]);

    const åpneSide = useCallback(
        (side: Menysider): void => {
            settValgtSide(side);
            if (erStorSkjerm) {
                settÅpen(true);
            } else {
                settÅpenPåSmalSkjerm(true);
            }
        },
        [erStorSkjerm, settValgtSide, settÅpen, settÅpenPåSmalSkjerm]
    );

    const lukkPåSmalSkjerm = useCallback((): void => {
        settÅpenPåSmalSkjerm(false);
    }, [settÅpenPåSmalSkjerm]);

    return {
        erStorSkjerm,
        visPanel,
        tarOverSkjermen: visPanel && !erStorSkjerm,
        veksle,
        lukkPåSmalSkjerm,
        åpneSide,
    };
};
