import type {
    BehandlingDto,
    BehandlingsstegEnum,
    BehandlingsstegsinfoDto,
    BehandlingsstegstatusEnum,
} from '../generated';

export const lagBehandling = (overrides: Partial<BehandlingDto> = {}): BehandlingDto => ({
    behandlingId: 'uuid-1',
    eksternBrukId: 'uuid-2',
    kanSetteTilbakeTilFakta: false,
    kanEndres: false,
    behandlingsstegsinfo: [],
    status: 'OPPRETTET',
    type: 'TILBAKEKREVING',
    opprettetDato: new Date().toISOString(),
    varselSendt: false,
    fagsystemsbehandlingId: 'id-1',
    erBehandlingHenlagt: false,
    saksbehandlingstype: 'ORDINÆR',
    manuelleBrevmottakere: [],
    kanRevurderingOpprettes: false,
    erBehandlingPåVent: false,
    harVerge: false,
    resultatstype: undefined,
    kanHenleggeBehandling: false,
    erNyModell: false,
    avsluttetDato: undefined,
    endretTidspunkt: new Date().toISOString(),
    vedtaksdato: undefined,
    enhetskode: '0001',
    enhetsnavn: 'Oslo',
    ansvarligSaksbehandler: 'test saksbehandler',
    ansvarligBeslutter: undefined,
    eksternFagsakId: 'id-2',
    behandlingsårsakstype: undefined,
    støtterManuelleBrevmottakere: false,
    harManuelleBrevmottakere: false,
    begrunnelseForTilbakekreving: undefined,
    ...overrides,
});

export type StegValg = {
    status?: BehandlingsstegsinfoDto['behandlingsstegstatus'];
    venteårsak?: BehandlingsstegsinfoDto['venteårsak'];
    tidsfrist?: BehandlingsstegsinfoDto['tidsfrist'];
};

const lagSteg = (
    steg: BehandlingsstegEnum,
    defaultStatus: BehandlingsstegstatusEnum,
    valg: StegValg = {}
): BehandlingsstegsinfoDto => ({
    behandlingssteg: steg,
    behandlingsstegstatus: valg.status ?? defaultStatus,
    venteårsak: valg.venteårsak,
    tidsfrist: valg.tidsfrist,
});

/** Utført default steg */
export const lagFaktaSteg = (valg: StegValg = {}): BehandlingsstegsinfoDto =>
    lagSteg('FAKTA', 'UTFØRT', valg);

/** Utført default steg */
export const lagForeldelseSteg = (valg: StegValg = {}): BehandlingsstegsinfoDto =>
    lagSteg('FORELDELSE', 'UTFØRT', valg);

/** Klar default steg */
export const lagVilkårsvurderingSteg = (valg: StegValg = {}): BehandlingsstegsinfoDto =>
    lagSteg('VILKÅRSVURDERING', 'KLAR', valg);

/** Klar default steg */
export const lagBrevmottakerSteg = (valg: StegValg = {}): BehandlingsstegsinfoDto =>
    lagSteg('BREVMOTTAKER', 'KLAR', valg);

/** Klar default steg */
export const lagForeslåVedtakSteg = (valg: StegValg = {}): BehandlingsstegsinfoDto =>
    lagSteg('FORESLÅ_VEDTAK', 'KLAR', valg);

//TODO: Skal fjernes når vi tar i bruk BehandlingDto over
export const lagBehandlingDto = (overrides: Partial<BehandlingDto> = {}): BehandlingDto => ({
    ...lagBehandling(),
    ...overrides,
});
