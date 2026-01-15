import type { BehandlingContextType } from '../context/BehandlingContext';
import type { BehandlingDto } from '../generated';

import { lagBehandling } from './behandlingFactory';

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
