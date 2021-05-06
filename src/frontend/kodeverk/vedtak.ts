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
    GROV_UAKTSOMHET = 'GROV_UAKTSOMHET',
    SIMPEL_UAKTSOMHET = 'SIMPEL_UAKTSOMHET',
    GOD_TRO = 'GOD_TRO',
    FORELDET = 'FORELDET',
}

export const vurderinger: Record<Vurdering, string> = {
    FORSETT: 'Forsett',
    GROV_UAKTSOMHET: 'Grov uaktsomhet',
    SIMPEL_UAKTSOMHET: 'Simpel uaktsomhet',
    GOD_TRO: 'Handlet i god tro',
    FORELDET: 'Foreldet',
};

export enum Avsnittstype {
    OPPSUMMERING = 'OPPSUMMERING',
    PERIODE = 'PERIODE',
    TILLEGGSINFORMASJON = 'TILLEGGSINFORMASJON',
}

export enum Underavsnittstype {
    FAKTA = 'FAKTA',
    FORELDELSE = 'FORELDELSE',
    VILKÅR = 'VILKÅR',
    SÆRLIGEGRUNNER = 'SÆRLIGEGRUNNER',
    SÆRLIGEGRUNNER_ANNET = 'SÆRLIGEGRUNNER_ANNET',
}
