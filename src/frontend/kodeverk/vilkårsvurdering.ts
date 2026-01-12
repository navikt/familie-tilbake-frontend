export enum Vilkårsresultat {
    ForstoBurdeForstått = 'FORSTO_BURDE_FORSTÅTT',
    FeilOpplysningerFraBruker = 'FEIL_OPPLYSNINGER_FRA_BRUKER',
    MangelfulleOpplysningerFraBruker = 'MANGELFULLE_OPPLYSNINGER_FRA_BRUKER',
    GodTro = 'GOD_TRO',
    Udefinert = 'UDEFINERT',
}

export const vilkårsvurderingStegInfotekst =
    'Fastsett tilbakekreving etter §22-15. Del opp perioden ved behov for ulik vurdering.';

export const vilkårsvurderingStegInfotekstBarnetrygd =
    'Fastsett tilbakekreving etter barnetrygdloven § 13 og folketrygdloven § 22-15. Del opp perioden ved behov for ulik vurdering.';

export const vilkårsvurderingStegInfotekstKontantstøtte =
    'Fastsett tilbakekreving etter kontantstøtteloven § 11 og folketrygdloven § 22-15. Del opp perioden ved behov for ulik vurdering.';

export const vilkårsvurderingStegInfotekstForYtelsestype: Record<string, string> = {
    BARNETRYGD: vilkårsvurderingStegInfotekstBarnetrygd,
    KONTANTSTØTTE: vilkårsvurderingStegInfotekstKontantstøtte,
    OVERGANGSSTØNAD: vilkårsvurderingStegInfotekst,
    BARNETILSYN: vilkårsvurderingStegInfotekst,
    SKOLEPENGER: vilkårsvurderingStegInfotekst,
    TILLEGGSSTØNAD: vilkårsvurderingStegInfotekst,
    ARBEIDSAVKLARINGSPENGER: vilkårsvurderingStegInfotekst,
};

export const vilkårsresultatTyper = [
    Vilkårsresultat.ForstoBurdeForstått,
    Vilkårsresultat.FeilOpplysningerFraBruker,
    Vilkårsresultat.MangelfulleOpplysningerFraBruker,
    Vilkårsresultat.GodTro,
];

export enum Aktsomhet {
    Forsettlig = 'FORSETTLIG',
    GrovtUaktsomt = 'GROVT_UAKTSOMT',
    Uaktsomt = 'UAKTSOMT',
}

export const aktsomheter: Record<Aktsomhet, string> = {
    [Aktsomhet.Uaktsomt]: 'Uaktsomt',
    [Aktsomhet.GrovtUaktsomt]: 'Grovt uaktsomt',
    [Aktsomhet.Forsettlig]: 'Forsettlig',
};

export const forstodBurdeForståttAktsomheter: Record<Aktsomhet, string> = {
    [Aktsomhet.Uaktsomt]: 'Mottaker burde forstått at utbetalingen skyldtes en feil',
    [Aktsomhet.GrovtUaktsomt]: 'Mottaker må ha forstått at utbetalingen skyldtes en feil',
    [Aktsomhet.Forsettlig]: 'Mottaker forsto at utbetalingen skyldtes en feil',
};

export enum SærligeGrunner {
    GradAvUaktsomhet = 'GRAD_AV_UAKTSOMHET',
    HeltEllerDelvisNavsFeil = 'HELT_ELLER_DELVIS_NAVS_FEIL',
    StørrelseBeløp = 'STØRRELSE_BELØP',
    TidFraUtbetaling = 'TID_FRA_UTBETALING',
    Annet = 'ANNET',
}

export const særligegrunner: Record<SærligeGrunner, string> = {
    [SærligeGrunner.GradAvUaktsomhet]: 'Graden av uaktsomhet hos den som kravet retter seg mot',
    [SærligeGrunner.StørrelseBeløp]: 'Størrelsen av det feilutbetalte beløpet',
    [SærligeGrunner.TidFraUtbetaling]: 'Hvor lang tid det har gått siden utbetalingen fant sted',
    [SærligeGrunner.HeltEllerDelvisNavsFeil]: 'Om feilen helt eller delvis kan tilskrives Nav',
    [SærligeGrunner.Annet]: 'Annet',
};

export const særligeGrunnerTyper = [
    SærligeGrunner.GradAvUaktsomhet,
    SærligeGrunner.HeltEllerDelvisNavsFeil,
    SærligeGrunner.StørrelseBeløp,
    SærligeGrunner.TidFraUtbetaling,
    SærligeGrunner.Annet,
];
