export enum Vedtaksresultat {
    FULL_TILBAKEBETALING = 'FULL_TILBAKEBETALING',
    DELVIS_TILBAKEBETALING = 'DELVIS_TILBAKEBETALING',
    INGEN_TILBAKEBETALING = 'INGEN_TILBAKEBETALING',
}

export const vedtaksresultater: Record<Vedtaksresultat, string> = {
    FULL_TILBAKEBETALING: 'Full tilbakebetaling',
    DELVIS_TILBAKEBETALING: 'Delvis tilbakebetaling',
    INGEN_TILBAKEBETALING: 'Ingen tilbakebetaling',
};

export enum Vurdering {
    FORSETT = 'FORSETT',
    GROVT_UAKTSOM = 'GROVT_UAKTSOM',
    SIMPEL_UAKTSOM = 'SIMPEL_UAKTSOM',
    GOD_TRO = 'GOD_TRO',
    FORELDET = 'FORELDET',
}

export const vurderinger: Record<Vurdering, string> = {
    FORSETT: 'Forsett',
    GROVT_UAKTSOM: 'Grov uaktsomhet',
    SIMPEL_UAKTSOM: 'Simpel uaktsomhet',
    GOD_TRO: 'Handlet i god tro',
    FORELDET: 'Foreldet',
};

export enum Avsnittstype {
    OPPSUMMERING = 'OPPSUMMERING',
    PERIODE = 'PERIODE',
    TILLEGGSINFORMASJON = 'TILLEGGSINFORMASJON',
}

export enum Underavsnittstype {
    OPPSUMMERING = 'OPPSUMMERING',
    FAKTA = 'FAKTA',
    FORELDELSE = 'FORELDELSE',
    VILKAR = 'VILKÅR',
    SARLIGEGRUNNER = 'SÆRLIGEGRUNNER',
    SARLIGEGRUNNER_ANNET = 'SÆRLIGEGRUNNER_ANNET',
}
