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
}

export type ForeldelsePeriode = {
    foreldelseVurderingType: Foreldelsevurdering;
    begrunnelse?: string;
    foreldelsesfrist?: string;
    oppdagelsesDato?: string;
} & FeilutbetalingPeriode;

export interface IFeilutbetalingForeldelse {
    perioder: ForeldelsePeriode[];
}

export type Aktsomhetsvurdering = {
    begrunnelse?: string;
    tilbakekrevesBelop?: number;
    aktsomhet?: Aktsomhet;
    særligeGrunner?: SærligeGrunner[];
    harGrunnerTilReduksjon?: boolean;
    andelTilbakekreves?: number;
    ileggRenter?: boolean;
    tilbakekrevSelvOmBeløpErUnder4Rettsgebyr?: boolean;
    annetBegrunnelse?: string;
    særligGrunnerBegrunnelse?: string;
};

export type VilkårsresultatInfo = {
    vilkårsresultat?: Vilkårsresultat;
    begrunnelse?: string;
    erBeløpetIBehold?: boolean;
    tilbakekrevesBelop?: number;
    aktsomhetsvurdering?: Aktsomhetsvurdering;
};

export type YtelseInfo = {
    aktivitet: string;
    beløp: number;
};

export type VilkårsvurderingPeriode = {
    hendelseType?: HendelseType;
    foreldelse: {
        foreldelseVurderingType: Foreldelsevurdering;
        begrunnelse?: string;
    };
    ytelser?: YtelseInfo[];
    vilkårsresultat?: VilkårsresultatInfo;
} & FeilutbetalingPeriode;

export interface IFeilutbetalingVilkårsvurdering {
    perioder: VilkårsvurderingPeriode[];
    rettsgebyr: number;
}
