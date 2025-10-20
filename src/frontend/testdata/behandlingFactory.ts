/**
 * Fagsak x mange
 * Saksbehandler x 1
 * ManuelleBrevmottakere x mange
 * FaktaPeriode x1
 * FaktaResponse x1
 * VilkårsvuderingSkjema x1
 * BeregningsresultatPeriode[] x1
 * Beregningsresultat x1
 * VedtaksbrevAvsnitt[] x1
 * FaktaPeriodeSkjemaData x1
 * VilkårsvurderingsPeriode[] x1
 * ForeldelsePeriode[] x1
 * VilkårsvurderingResponse x2
 * VilkårsvurderingPeriodeSkjemaData x1
 * VilkårsvurderingPeriode x1
 * BrevmottakerFormData x1
 * ForeldelsePeriodeSkjemaData x1
 */
import type { Behandlingsstegstilstand } from '../typer/behandling';

import {
    Behandlingssteg,
    Behandlingsstegstatus,
    Behandlingstatus,
    Behandlingstype,
    Saksbehandlingstype,
    type Behandling,
} from '../typer/behandling';

export const lagBehandling = (overrides: Partial<Behandling> = {}): Behandling => ({
    behandlingId: 'uuid-1',
    eksternBrukId: 'uuid-2',
    kanSetteTilbakeTilFakta: true,
    kanEndres: true,
    behandlingsstegsinfo: [],
    status: Behandlingstatus.Opprettet,
    type: Behandlingstype.Tilbakekreving,
    opprettetDato: new Date().toISOString(),
    varselSendt: false,
    fagsystemsbehandlingId: 'id-1',
    erBehandlingHenlagt: false,
    saksbehandlingstype: Saksbehandlingstype.Ordinær,
    manuelleBrevmottakere: [],
    kanRevurderingOpprettes: true,
    erBehandlingPåVent: false,
    harVerge: false,
    resultatstype: null,
    kanHenleggeBehandling: true,
    erNyModell: false,
    avsluttetDato: null,
    endretTidspunkt: '',
    vedtaksDato: null,
    enhetskode: '',
    enhetsnavn: '',
    ansvarligSaksbehandler: '',
    ansvarligBeslutter: null,
    eksternFaksakId: 'id-2',
    behandlingsårsakstype: null,
    støtterManuelleBrevmottakere: false,
    harManuelleBrevmottakere: false,
    begrunnelseForTilbakekreving: null,
    ...overrides,
});

export type StegValg = {
    status?: Behandlingsstegstilstand['behandlingsstegstatus'];
    venteårsak?: Behandlingsstegstilstand['venteårsak'];
    tidsfrist?: Behandlingsstegstilstand['tidsfrist'];
};

const lagSteg = (
    steg: Behandlingssteg,
    defaultStatus: Behandlingsstegstatus,
    valg: StegValg = {}
): Behandlingsstegstilstand => ({
    behandlingssteg: steg,
    behandlingsstegstatus: valg.status ?? defaultStatus,
    venteårsak: valg.venteårsak,
    tidsfrist: valg.tidsfrist,
});

/** Utført default steg */
export const lagFaktaSteg = (valg: StegValg = {}): Behandlingsstegstilstand =>
    lagSteg(Behandlingssteg.Fakta, Behandlingsstegstatus.Utført, valg);

/** Utført default steg */
export const lagForeldelseSteg = (valg: StegValg = {}): Behandlingsstegstilstand =>
    lagSteg(Behandlingssteg.Foreldelse, Behandlingsstegstatus.Utført, valg);

/** Klar default steg */
export const lagVilkårsvurderingSteg = (valg: StegValg = {}): Behandlingsstegstilstand =>
    lagSteg(Behandlingssteg.Vilkårsvurdering, Behandlingsstegstatus.Klar, valg);

/** Klar default steg */
export const lagBrevmottakerSteg = (valg: StegValg = {}): Behandlingsstegstilstand =>
    lagSteg(Behandlingssteg.Brevmottaker, Behandlingsstegstatus.Klar, valg);

/** Klar default steg */
export const lagForeslåVedtakSteg = (valg: StegValg = {}): Behandlingsstegstilstand =>
    lagSteg(Behandlingssteg.ForeslåVedtak, Behandlingsstegstatus.Klar, valg);
