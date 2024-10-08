import {
    HendelseType,
    HendelseUndertype,
    Foreldelsevurdering,
    Vilkårsresultat,
    Aktsomhet,
    SærligeGrunner,
} from '../kodeverk';

export enum Tilbakekrevingsvalg {
    OPPRETT_TILBAKEKREVING_MED_VARSEL = 'OPPRETT_TILBAKEKREVING_MED_VARSEL',
    OPPRETT_TILBAKEKREVING_UTEN_VARSEL = 'OPPRETT_TILBAKEKREVING_UTEN_VARSEL',
    IGNORER_TILBAKEKREVING = 'IGNORER_TILBAKEKREVING',
}

export const tilbakekrevingsvalg: Record<Tilbakekrevingsvalg, string> = {
    OPPRETT_TILBAKEKREVING_MED_VARSEL: 'Opprett tilbakekreving, send varsel',
    OPPRETT_TILBAKEKREVING_UTEN_VARSEL: 'Opprett tilbakekreving, ikke send varsel',
    IGNORER_TILBAKEKREVING: 'Avvent tilbakekreving',
};

export type Periode = {
    fom: string;
    tom: string;
};

export type FeilutbetalingPeriode = {
    periode: Periode;
    feilutbetaltBeløp: number;
};

export type FaktaPeriode = {
    hendelsestype?: HendelseType;
    hendelsesundertype?: HendelseUndertype;
} & FeilutbetalingPeriode;

export interface IFeilutbetalingFakta {
    feilutbetaltePerioder: FaktaPeriode[];
    totalFeilutbetaltPeriode: Periode;
    totaltFeilutbetaltBeløp: number;
    varsletBeløp?: number;
    faktainfo?: {
        revurderingsårsak?: string;
        revurderingsresultat?: string;
        tilbakekrevingsvalg?: Tilbakekrevingsvalg;
        konsekvensForYtelser?: string[];
    };
    revurderingsvedtaksdato: string;
    begrunnelse?: string;
    kravgrunnlagReferanse?: string;
    vurderingAvBrukersUttalelse: VurderingAvBrukersUttalelse;
    opprettetTid: string;
}

export interface VurderingAvBrukersUttalelse {
    harBrukerUttaltSeg: HarBrukerUttaltSegValg;
    beskrivelse?: string;
}

export enum HarBrukerUttaltSegValg {
    JA = 'JA',
    NEI = 'NEI',
    IKKE_AKTUELT = 'IKKE_AKTUELT',
    IKKE_VURDERT = 'IKKE_VURDERT',
}

export const harBrukerUttaltSegValgTilTekst: Record<HarBrukerUttaltSegValg, string> = {
    JA: 'Ja',
    NEI: 'Nei',
    IKKE_AKTUELT: 'Ikke aktuelt',
    IKKE_VURDERT: 'Ikke vurdert',
};

export type ForeldelsePeriode = {
    foreldelsesvurderingstype?: Foreldelsevurdering;
    begrunnelse?: string;
    foreldelsesfrist?: string;
    oppdagelsesdato?: string;
} & FeilutbetalingPeriode;

export interface IFeilutbetalingForeldelse {
    foreldetPerioder: ForeldelsePeriode[];
}

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

export type ReduserteBeløpInfo = {
    trekk: boolean;
    beløp: number;
};

export type VilkårsvurderingPeriode = {
    hendelsestype: HendelseType;
    aktiviteter?: YtelseInfo[];
    reduserteBeløper?: ReduserteBeløpInfo[];
    foreldet: boolean;
    begrunnelse?: string;
    vilkårsvurderingsresultatInfo?: VilkårsresultatInfo;
} & FeilutbetalingPeriode;

export interface IFeilutbetalingVilkårsvurdering {
    perioder: VilkårsvurderingPeriode[];
    rettsgebyr: number;
    opprettetTid?: string;
}

export interface IBeregnSplittetPeriodeRespons {
    beregnetPerioder: FeilutbetalingPeriode[];
}
