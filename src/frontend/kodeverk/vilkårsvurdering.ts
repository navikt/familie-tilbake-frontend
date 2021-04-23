export enum Vilkårsresultat {
    FORSTO_BURDE_FORSTÅTT = 'FORSTO_BURDE_FORSTÅTT',
    FEIL_OPPLYSNINGER_FRA_BRUKER = 'FEIL_OPPLYSNINGER_FRA_BRUKER',
    MANGELFULLE_OPPLYSNINGER_FRA_BRUKER = 'MANGELFULLE_OPPLYSNINGER_FRA_BRUKER',
    GOD_TRO = 'GOD_TRO',
}

export const vilkårsresultater = {
    FORSTO_BURDE_FORSTÅTT:
        'Ja, mottaker forsto eller burde forstått at utbetalingen skyldtes en feil (1. ledd, 1. punkt)',
    FEIL_OPPLYSNINGER_FRA_BRUKER:
        'Ja, mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt feilaktige opplysninger (1. ledd, 2 punkt)',
    MANGELFULLE_OPPLYSNINGER_FRA_BRUKER:
        'Ja, mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt mangelfulle opplysninger (1. ledd, 2 punkt)',
    GOD_TRO: 'Nei, mottaker har mottatt beløpet i god tro (1. ledd)',
};

export const vilkårsresultatTyper = [
    Vilkårsresultat.FORSTO_BURDE_FORSTÅTT,
    Vilkårsresultat.FEIL_OPPLYSNINGER_FRA_BRUKER,
    Vilkårsresultat.MANGELFULLE_OPPLYSNINGER_FRA_BRUKER,
    Vilkårsresultat.GOD_TRO,
];

export enum Aktsomhet {
    FORSETT = 'FORSETT',
    GROV_UAKTSOMHET = 'GROV_UAKTSOMHET',
    SIMPEL_UAKTSOMHET = 'SIMPEL_UAKTSOMHET',
}

export const aktsomheter = {
    FORSETT: 'Forsett',
    GROV_UAKTSOMHET: 'Grov uaktsomhet',
    SIMPEL_UAKTSOMHET: 'Simpel uaktsomhet',
};

export const forstodBurdeForståttAktsomheter = {
    FORSETT: 'Forsto',
    GROV_UAKTSOMHET: 'Må ha forstått',
    SIMPEL_UAKTSOMHET: 'Burde ha forstått',
};

export const aktsomhetTyper = [
    Aktsomhet.SIMPEL_UAKTSOMHET,
    Aktsomhet.GROV_UAKTSOMHET,
    Aktsomhet.FORSETT,
];

export enum SærligeGrunner {
    GRAD_AV_UAKTSOMHET = 'GRAD_AV_UAKTSOMHET',
    HELT_ELLER_DELVIS_NAVS_FEIL = 'HELT_ELLER_DELVIS_NAVS_FEIL',
    STØRRELSE_BELØP = 'STØRRELSE_BELØP',
    TID_FRA_UTBETALING = 'TID_FRA_UTBETALING',
    ANNET = 'ANNET',
}

export const særligegrunner = {
    GRAD_AV_UAKTSOMHET: 'Graden av uaktsomhet hos den kravet retter seg mot',
    HELT_ELLER_DELVIS_NAVS_FEIL: 'Om feilen helt eller delvis kan tilskrives NAV',
    STØRRELSE_BELØP: 'Størrelsen på feilutbetalt beløp',
    TID_FRA_UTBETALING: 'Hvor lang tid siden utbetalingen fant sted',
    ANNET: 'Annet',
};

export const særligeGrunnerTyper = [
    SærligeGrunner.GRAD_AV_UAKTSOMHET,
    SærligeGrunner.HELT_ELLER_DELVIS_NAVS_FEIL,
    SærligeGrunner.STØRRELSE_BELØP,
    SærligeGrunner.TID_FRA_UTBETALING,
    SærligeGrunner.ANNET,
];
