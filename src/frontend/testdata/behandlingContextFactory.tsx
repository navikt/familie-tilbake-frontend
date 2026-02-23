import type { BehandlingStateContextType } from '~/context/BehandlingStateContext';
import type { BehandlingDto } from '~/generated';
import type { UseUlagretEndringerReturn } from '~/hooks/useUlagretEndringer';

import * as React from 'react';

import { BehandlingContext } from '~/context/BehandlingContext';
import { BehandlingStateContext } from '~/context/BehandlingStateContext';
import { useUlagretEndringer } from '~/hooks/useUlagretEndringer';

import { lagBehandling } from './behandlingFactory';

export type BehandlingStateContextOverrides = {
    behandlingILesemodus?: boolean;
    aktivtSteg?: BehandlingStateContextType['aktivtSteg'];
    ventegrunn?: BehandlingStateContextType['ventegrunn'];
    harKravgrunnlag?: boolean;
    actionBarStegtekst?: BehandlingStateContextType['actionBarStegtekst'];
    erStegBehandlet?: BehandlingStateContextType['erStegBehandlet'];
    erStegAutoutført?: BehandlingStateContextType['erStegAutoutført'];
    erBehandlingReturnertFraBeslutter?: BehandlingStateContextType['erBehandlingReturnertFraBeslutter'];
    harVærtPåFatteVedtakSteget?: BehandlingStateContextType['harVærtPåFatteVedtakSteget'];
    harUlagredeData?: boolean;
    settIkkePersistertKomponent?: BehandlingStateContextType['settIkkePersistertKomponent'];
    nullstillIkkePersisterteKomponenter?: BehandlingStateContextType['nullstillIkkePersisterteKomponenter'];
    innholdsbredde?: BehandlingStateContextType['innholdsbredde'];
    settInnholdsbredde?: BehandlingStateContextType['settInnholdsbredde'];
};

export type BehandlingContextOverrides = BehandlingStateContextOverrides & {
    behandling?: BehandlingDto;
};

export const lagBehandlingStateContext = (
    overrides: BehandlingStateContextOverrides = {},
    ulagretEndringer?: UseUlagretEndringerReturn
): BehandlingStateContextType => {
    return {
        behandlingILesemodus: overrides.behandlingILesemodus ?? false,
        aktivtSteg: overrides.aktivtSteg ?? undefined,
        ventegrunn: overrides.ventegrunn ?? undefined,
        harKravgrunnlag: overrides.harKravgrunnlag ?? false,
        actionBarStegtekst:
            overrides.actionBarStegtekst ?? ((): string | undefined => 'Steg 1 av 4'),
        erStegBehandlet: overrides.erStegBehandlet ?? ((): boolean => false),
        erStegAutoutført: overrides.erStegAutoutført ?? ((): boolean => false),
        erBehandlingReturnertFraBeslutter:
            overrides.erBehandlingReturnertFraBeslutter ?? ((): boolean => false),
        harVærtPåFatteVedtakSteget: overrides.harVærtPåFatteVedtakSteget ?? ((): boolean => false),
        harUlagredeData: overrides.harUlagredeData ?? ulagretEndringer?.harUlagredeData ?? false,
        settIkkePersistertKomponent:
            overrides.settIkkePersistertKomponent ??
            ulagretEndringer?.settIkkePersistertKomponent ??
            ((): void => {}),
        nullstillIkkePersisterteKomponenter:
            overrides.nullstillIkkePersisterteKomponenter ??
            ulagretEndringer?.nullstillIkkePersisterteKomponenter ??
            ((): void => {}),
        innholdsbredde: overrides.innholdsbredde ?? 800,
        settInnholdsbredde: overrides.settInnholdsbredde ?? ((): void => {}),
    };
};

/**
 * Test provider som wrapper både BehandlingContext og BehandlingStateContext.
 * Bruk denne for enkel testing av komponenter som trenger begge kontekstene.
 */
export const TestBehandlingProvider: React.FC<{
    behandling?: BehandlingDto;
    stateOverrides?: BehandlingStateContextOverrides;
    children: React.ReactNode;
}> = ({ behandling, stateOverrides = {}, children }) => {
    const ulagretEndringer = useUlagretEndringer();
    const behandlingValue = behandling ?? lagBehandling();
    const stateValue = lagBehandlingStateContext(stateOverrides, ulagretEndringer);

    return (
        <BehandlingContext.Provider value={behandlingValue}>
            <BehandlingStateContext.Provider value={stateValue}>
                {children}
            </BehandlingStateContext.Provider>
        </BehandlingContext.Provider>
    );
};
