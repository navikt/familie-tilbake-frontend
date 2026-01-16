import type { BehandlingContextType } from '../context/BehandlingContext';
import type { BehandlingDto } from '../generated';

import * as React from 'react';

import { lagBehandling } from './behandlingFactory';
import { BehandlingContext } from '../context/BehandlingContext';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';

export type BehandlingContextOverrides = {
    behandling?: BehandlingDto;
    behandlingILesemodus?: boolean;
    aktivtSteg?: BehandlingContextType['aktivtSteg'];
    ventegrunn?: BehandlingContextType['ventegrunn'];
    harKravgrunnlag?: boolean;
    actionBarStegtekst?: BehandlingContextType['actionBarStegtekst'];
    erStegBehandlet?: BehandlingContextType['erStegBehandlet'];
    erStegAutoutført?: BehandlingContextType['erStegAutoutført'];
    erBehandlingReturnertFraBeslutter?: BehandlingContextType['erBehandlingReturnertFraBeslutter'];
    harVærtPåFatteVedtakSteget?: BehandlingContextType['harVærtPåFatteVedtakSteget'];
    harUlagredeData?: boolean;
    settIkkePersistertKomponent?: BehandlingContextType['settIkkePersistertKomponent'];
    nullstillIkkePersisterteKomponenter?: BehandlingContextType['nullstillIkkePersisterteKomponenter'];
};

export const lagBehandlingContext = (
    overrides: BehandlingContextOverrides = {}
): BehandlingContextType => {
    const behandling = overrides.behandling ?? lagBehandling();

    return {
        behandling,
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
        harUlagredeData: overrides.harUlagredeData ?? false,
        settIkkePersistertKomponent: overrides.settIkkePersistertKomponent ?? ((): void => {}),
        nullstillIkkePersisterteKomponenter:
            overrides.nullstillIkkePersisterteKomponenter ?? ((): void => {}),
    };
};

/**
 * Test provider som bruker ekte useUnsavedChanges hook.
 * Bruk denne når tester trenger reaktiv unsaved changes-funksjonalitet.
 */
export const TestBehandlingProvider: React.FC<{
    behandling?: BehandlingDto;
    overrides?: Omit<
        BehandlingContextOverrides,
        | 'behandling'
        | 'harUlagredeData'
        | 'nullstillIkkePersisterteKomponenter'
        | 'settIkkePersistertKomponent'
    >;
    children: React.ReactNode;
}> = ({ behandling, overrides = {}, children }) => {
    const unsavedChanges = useUnsavedChanges();
    const contextValue = lagBehandlingContext({
        behandling,
        ...overrides,
        ...unsavedChanges,
    });

    return <BehandlingContext.Provider value={contextValue}>{children}</BehandlingContext.Provider>;
};
