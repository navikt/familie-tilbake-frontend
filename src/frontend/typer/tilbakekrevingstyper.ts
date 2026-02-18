import type {
    HendelseType,
    HendelseUndertype,
    Foreldelsevurdering,
    Vilkårsresultat,
    Aktsomhet,
    SærligeGrunner,
} from '@kodeverk';

export enum Tilbakekrevingsvalg {
    OpprettTilbakekrevingMedVarsel = 'OPPRETT_TILBAKEKREVING_MED_VARSEL',
    OpprettTilbakekrevingUtenVarsel = 'OPPRETT_TILBAKEKREVING_UTEN_VARSEL',
    IgnorerTilbakekreving = 'IGNORER_TILBAKEKREVING',
}

export const tilbakekrevingsvalg: Record<Tilbakekrevingsvalg, string> = {
    [Tilbakekrevingsvalg.OpprettTilbakekrevingMedVarsel]: 'Opprett tilbakekreving, send varsel',
    [Tilbakekrevingsvalg.OpprettTilbakekrevingUtenVarsel]:
        'Opprett tilbakekreving, ikke send varsel',
    [Tilbakekrevingsvalg.IgnorerTilbakekreving]: 'Avvent tilbakekreving',
};

export type Periode = {
    fom: string;
    tom: string;
};

export type FeilutbetalingPeriode = {
    periode: Periode;
    feilutbetaltBeløp: number;
};

export interface FaktaPeriode extends FeilutbetalingPeriode {
    hendelsestype?: HendelseType;
    hendelsesundertype?: HendelseUndertype;
}

type FaktaInfo = {
    revurderingsårsak?: string;
    revurderingsresultat?: string;
    tilbakekrevingsvalg?: Tilbakekrevingsvalg;
    konsekvensForYtelser?: string[];
};

export type FaktaResponse = {
    feilutbetaltePerioder: FaktaPeriode[];
    totalFeilutbetaltPeriode: Periode;
    totaltFeilutbetaltBeløp: number;
    varsletBeløp?: number;
    faktainfo?: FaktaInfo;
    revurderingsvedtaksdato: string;
    begrunnelse?: string;
    kravgrunnlagReferanse?: string;
    vurderingAvBrukersUttalelse: VurderingAvBrukersUttalelse;
    opprettetTid: string;
};

export type VurderingAvBrukersUttalelse = {
    harBrukerUttaltSeg: HarBrukerUttaltSegValg;
    beskrivelse?: string;
};

export enum HarBrukerUttaltSegValg {
    Ja = 'JA',
    Nei = 'NEI',
    IkkeAktuelt = 'IKKE_AKTUELT',
    IkkeVurdert = 'IKKE_VURDERT',
}

export const harBrukerUttaltSegValgTilTekst: Record<HarBrukerUttaltSegValg, string> = {
    [HarBrukerUttaltSegValg.Ja]: 'Ja',
    [HarBrukerUttaltSegValg.Nei]: 'Nei',
    [HarBrukerUttaltSegValg.IkkeAktuelt]: 'Ikke aktuelt',
    [HarBrukerUttaltSegValg.IkkeVurdert]: 'Ikke vurdert',
};

export interface ForeldelsePeriode extends FeilutbetalingPeriode {
    foreldelsesvurderingstype?: Foreldelsevurdering;
    begrunnelse?: string;
    foreldelsesfrist?: string;
    oppdagelsesdato?: string;
}

export type ForeldelseResponse = {
    foreldetPerioder: ForeldelsePeriode[];
};

export type GodTro = {
    begrunnelse: string;
    beløpErIBehold: boolean;
    beløpTilbakekreves?: number;
};

export type SærligeGrunnerDto = {
    særligGrunn: SærligeGrunner;
    begrunnelse?: string;
};

export type Aktsomhetsvurdering = {
    begrunnelse: string;
    aktsomhet: Aktsomhet;
    andelTilbakekreves?: number;
    ileggRenter?: boolean;
    tilbakekrevSmåbeløp?: boolean;
    særligeGrunnerBegrunnelse?: string;
    særligeGrunner?: SærligeGrunnerDto[];
    særligeGrunnerTilReduksjon?: boolean;
    beløpTilbakekreves?: number;
};

type VilkårsresultatInfo = {
    vilkårsvurderingsresultat?: Vilkårsresultat;
    godTro?: GodTro;
    aktsomhet?: Aktsomhetsvurdering;
};

export type YtelseInfo = {
    aktivitet: string;
    beløp: number;
};

export interface VilkårsvurderingPeriode extends FeilutbetalingPeriode {
    hendelsestype: HendelseType;
    aktiviteter?: YtelseInfo[];
    foreldet: boolean;
    begrunnelse?: string;
    vilkårsvurderingsresultatInfo?: VilkårsresultatInfo;
}

export type VilkårsvurderingResponse = {
    perioder: VilkårsvurderingPeriode[];
    rettsgebyr: number;
    opprettetTid?: string;
};

export type BeregnSplittetPeriodeRespons = {
    beregnetPerioder: FeilutbetalingPeriode[];
};
