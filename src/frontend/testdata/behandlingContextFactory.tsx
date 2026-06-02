import type { FC, ReactNode } from 'react';
import type { BehandlingStateContextType } from '~/context/BehandlingStateContext';
import type { BehandlingDto } from '~/generated';
import type { UseUlagretEndringerReturn } from '~/hooks/useUlagretEndringer';

import { BehandlingContext } from '~/context/BehandlingContext';
import { BehandlingStateContext } from '~/context/BehandlingStateContext';
import { useUlagretEndringer } from '~/hooks/useUlagretEndringer';
import { ActionBar } from '~/komponenter/action-bar/ActionBar';
import { useActionBarConfig } from '~/stores/actionBarStore';

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
    setIkkePersistertKomponent?: BehandlingStateContextType['setIkkePersistertKomponent'];
    nullstillIkkePersisterteKomponenter?: BehandlingStateContextType['nullstillIkkePersisterteKomponenter'];
    innholdsbredde?: BehandlingStateContextType['innholdsbredde'];
    setInnholdsbredde?: BehandlingStateContextType['setInnholdsbredde'];
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
        setIkkePersistertKomponent:
            overrides.setIkkePersistertKomponent ??
            ulagretEndringer?.setIkkePersistertKomponent ??
            ((): void => {}),
        nullstillIkkePersisterteKomponenter:
            overrides.nullstillIkkePersisterteKomponenter ??
            ulagretEndringer?.nullstillIkkePersisterteKomponenter ??
            ((): void => {}),
        innholdsbredde: overrides.innholdsbredde ?? 800,
        setInnholdsbredde: overrides.setInnholdsbredde ?? ((): void => {}),
    };
};

/**
 * Test provider som wrapper både BehandlingContext og BehandlingStateContext.
 * Bruk denne for enkel testing av komponenter som trenger begge kontekstene.
 */
const TestActionBar: FC = () => {
    const actionBarConfig = useActionBarConfig();

    return actionBarConfig ? <ActionBar {...actionBarConfig} /> : null;
};

export const TestBehandlingProvider: FC<{
    behandling?: BehandlingDto;
    stateOverrides?: BehandlingStateContextOverrides;
    children: ReactNode;
}> = ({ behandling, stateOverrides = {}, children }) => {
    const ulagretEndringer = useUlagretEndringer();
    const behandlingValue = behandling ?? lagBehandling();
    const stateValue = lagBehandlingStateContext(stateOverrides, ulagretEndringer);

    return (
        <BehandlingContext value={behandlingValue}>
            <BehandlingStateContext value={stateValue}>
                {children}
                <TestActionBar />
            </BehandlingStateContext>
        </BehandlingContext>
    );
};
