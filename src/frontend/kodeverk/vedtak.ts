export enum Vedtaksresultat {
    FullTilbakebetaling = 'FULL_TILBAKEBETALING',
    DelvisTilbakebetaling = 'DELVIS_TILBAKEBETALING',
    IngenTilbakebetaling = 'INGEN_TILBAKEBETALING',
}

export const vedtaksresultater: Record<Vedtaksresultat, string> = {
    [Vedtaksresultat.FullTilbakebetaling]: 'Full tilbakebetaling',
    [Vedtaksresultat.DelvisTilbakebetaling]: 'Delvis tilbakebetaling',
    [Vedtaksresultat.IngenTilbakebetaling]: 'Ingen tilbakebetaling',
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
