export enum Vilkårsresultat {
    ForstoBurdeForstått = 'FORSTO_BURDE_FORSTÅTT',
    FeilOpplysningerFraBruker = 'FEIL_OPPLYSNINGER_FRA_BRUKER',
    MangelfulleOpplysningerFraBruker = 'MANGELFULLE_OPPLYSNINGER_FRA_BRUKER',
    GodTro = 'GOD_TRO',
    Udefinert = 'UDEFINERT',
}

export const vilkårsresultater: Record<Vilkårsresultat, string> = {
    [Vilkårsresultat.ForstoBurdeForstått]:
        'Ja, mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
    [Vilkårsresultat.FeilOpplysningerFraBruker]:
        'Ja, mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt feilaktige opplysninger',
    [Vilkårsresultat.MangelfulleOpplysningerFraBruker]:
        'Ja, mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt mangelfulle opplysninger',
    [Vilkårsresultat.GodTro]: 'Nei, mottaker har mottatt beløpet i god tro',
    [Vilkårsresultat.Udefinert]: 'Udefinert',
};

export const vilkårsresultatHjelpetekster: Record<Vilkårsresultat, string> = {
    [Vilkårsresultat.ForstoBurdeForstått]: '1. ledd, 1. punkt',
    [Vilkårsresultat.FeilOpplysningerFraBruker]: '1. ledd, 2. punkt',
    [Vilkårsresultat.MangelfulleOpplysningerFraBruker]: '1. ledd, 2. punkt',
    [Vilkårsresultat.GodTro]: '1. ledd',
    [Vilkårsresultat.Udefinert]: 'Udefinert',
};

export const vilkårsvurderingStegInfotekst =
    'Fastsett tilbakekreving etter §22-15. Del opp perioden ved behov for ulik vurdering.';

export const vilkårsvurderingStegInfotekstBarnetrygd =
    'Fastsett tilbakekreving etter barnetrygdloven § 13 og folketrygdloven § 22-15. Del opp perioden ved behov for ulik vurdering.';

export const vilkårsvurderingStegInfotekstKontantstøtte =
    'Fastsett tilbakekreving etter kontantstøtteloven § 11 og folketrygdloven § 22-15. Del opp perioden ved behov for ulik vurdering.';

export const vilkårsresultatTyper = [
    Vilkårsresultat.ForstoBurdeForstått,
    Vilkårsresultat.FeilOpplysningerFraBruker,
    Vilkårsresultat.MangelfulleOpplysningerFraBruker,
    Vilkårsresultat.GodTro,
];

export enum Aktsomhet {
    Forsett = 'FORSETT',
    GrovUaktsomhet = 'GROV_UAKTSOMHET',
    SimpelUaktsomhet = 'SIMPEL_UAKTSOMHET',
}

export const aktsomheter: Record<Aktsomhet, string> = {
    [Aktsomhet.Forsett]: 'Forsett',
    [Aktsomhet.GrovUaktsomhet]: 'Grov uaktsomhet',
    [Aktsomhet.SimpelUaktsomhet]: 'Simpel uaktsomhet',
};

export const forstodBurdeForståttAktsomheter: Record<Aktsomhet, string> = {
    [Aktsomhet.Forsett]: 'Forsto',
    [Aktsomhet.GrovUaktsomhet]: 'Må ha forstått',
    [Aktsomhet.SimpelUaktsomhet]: 'Burde ha forstått',
};

export const aktsomhetTyper = [
    Aktsomhet.SimpelUaktsomhet,
    Aktsomhet.GrovUaktsomhet,
    Aktsomhet.Forsett,
];

export enum SærligeGrunner {
    GradAvUaktsomhet = 'GRAD_AV_UAKTSOMHET',
    HeltEllerDelvisNavsFeil = 'HELT_ELLER_DELVIS_NAVS_FEIL',
    StørrelseBeløp = 'STØRRELSE_BELØP',
    TidFraUtbetaling = 'TID_FRA_UTBETALING',
    Annet = 'ANNET',
}

export const særligegrunner: Record<SærligeGrunner, string> = {
    [SærligeGrunner.GradAvUaktsomhet]: 'Graden av uaktsomhet hos den kravet retter seg mot',
    [SærligeGrunner.HeltEllerDelvisNavsFeil]: 'Om feilen helt eller delvis kan tilskrives Nav',
    [SærligeGrunner.StørrelseBeløp]: 'Størrelsen på feilutbetalt beløp',
    [SærligeGrunner.TidFraUtbetaling]: 'Hvor lang tid siden utbetalingen fant sted',
    [SærligeGrunner.Annet]: 'Annet',
};

export const særligeGrunnerTyper = [
    SærligeGrunner.GradAvUaktsomhet,
    SærligeGrunner.HeltEllerDelvisNavsFeil,
    SærligeGrunner.StørrelseBeløp,
    SærligeGrunner.TidFraUtbetaling,
    SærligeGrunner.Annet,
];
