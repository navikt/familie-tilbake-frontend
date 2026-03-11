import type { Vedtaksresultat } from '~/generated-new';

export const vedtaksresultater: Record<Vedtaksresultat, string> = {
    FullTilbakebetaling: 'Full tilbakebetaling',
    DelvisTilbakebetaling: 'Delvis tilbakebetaling',
    IngenTilbakebetaling: 'Ingen tilbakebetaling',
};

export enum GamleVedtaksresultat {
    FullTilbakebetaling = 'FULL_TILBAKEBETALING',
    DelvisTilbakebetaling = 'DELVIS_TILBAKEBETALING',
    IngenTilbakebetaling = 'INGEN_TILBAKEBETALING',
}

export const gamleVedtaksresultater: Record<GamleVedtaksresultat, string> = {
    [GamleVedtaksresultat.FullTilbakebetaling]: 'Full tilbakebetaling',
    [GamleVedtaksresultat.DelvisTilbakebetaling]: 'Delvis tilbakebetaling',
    [GamleVedtaksresultat.IngenTilbakebetaling]: 'Ingen tilbakebetaling',
};

export enum Vurdering {
    Forsett = 'FORSETT',
    GrovUaktsomhet = 'GROV_UAKTSOMHET',
    SimpelUaktsomhet = 'SIMPEL_UAKTSOMHET',
    GodTro = 'GOD_TRO',
    Foreldet = 'FORELDET',
}

export const vurderinger: Record<Vurdering, string> = {
    [Vurdering.Forsett]: 'Forsett',
    [Vurdering.GrovUaktsomhet]: 'Grov uaktsomhet',
    [Vurdering.SimpelUaktsomhet]: 'Simpel uaktsomhet',
    [Vurdering.GodTro]: 'Handlet i god tro',
    [Vurdering.Foreldet]: 'Foreldet',
};

export enum Avsnittstype {
    Oppsummering = 'OPPSUMMERING',
    Periode = 'PERIODE',
    SammenslåttPeriode = 'SAMMENSLÅTT_PERIODE',
    Tilleggsinformasjon = 'TILLEGGSINFORMASJON',
}

export enum Underavsnittstype {
    Fakta = 'FAKTA',
    Foreldelse = 'FORELDELSE',
    Vilkår = 'VILKÅR',
    Særligegrunner = 'SÆRLIGEGRUNNER',
    SærligegrunnerAnnet = 'SÆRLIGEGRUNNER_ANNET',
}
